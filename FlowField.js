/* @flow */
import filter from 'lodash.filter';
import map from 'lodash.map';
import minBy from 'lodash.minby';
import { Map, List, Range } from 'immutable';

import type { Cell, Grid, FlowField, UpdateFunction, Position } from './types';

import utils from './basicFunctions';

export default function(
  step: number,
  height: number,
  width: number
): FlowField {
  const xRange: number = Math.ceil(width / step);
  const yRange: number = Math.ceil(height / step);
  const outOfBounds: Function = utils.generateOutOfBoundsFunction(
    xRange,
    yRange
  );

  let target: ?Position;

  let grid: Grid = List(Range(0, xRange)).map((): List<Cell> =>
    List(Range(0, yRange)).map((): Cell =>
      Map({
        distance: -1,
        updated: false,
        direction: [0, 0],
        obstacle: false
      })
    )
  );

  return {
    getImmutableGrid(): Grid {
      return grid;
    },
    getGrid(): Array<Array<Object>> {
      return grid.toJS();
    },
    getCell(position: Position): ?Object {
      if (outOfBounds(position)) {
        return undefined;
      }
      const cell = grid.getIn(position);
      return cell ? cell.toJS() : undefined;
    },
    getCellFromRealWorldCoordinates(position: Position): ?Object {
      const positionInLocalWorld: Position = position.map(coord =>
        Math.floor(coord / step)
      );
      if (outOfBounds(positionInLocalWorld)) {
        return undefined;
      }
      const cell: ?Cell = grid.getIn(positionInLocalWorld);
      return cell ? cell.toJS() : undefined;
    },
    setObstacle(obstacle: Position): Grid {
      if (outOfBounds(obstacle)) {
        return grid;
      }
      const cell: ?Cell = grid.getIn(obstacle);
      if (cell) {
        const updatedCell: Cell = cell.merge(
          Map({
            obstacle: true,
            distance: -1,
            updated: true,
            direction: [0, 0]
          })
        );
        grid = grid.setIn(obstacle, updatedCell);
      }
      return grid;
    },
    removeObstacle(obstacle: Position): Grid {
      if (outOfBounds(obstacle)) {
        return grid;
      }
      const cell: ?Cell = grid.getIn(obstacle);
      if (!cell) {
        return grid;
      }
      const updatedCell: Cell = cell.merge(
        Map({
          obstacle: false,
          distance: 0,
          updated: false,
          direction: [0, 0]
        })
      );
      grid = grid.setIn(obstacle, updatedCell);

      return grid;
    },
    setTarget(newTarget: Position): Grid {
      if (outOfBounds(newTarget)) {
        return grid;
      }
      const newTargetCell: ?Cell = grid.getIn(newTarget);
      if (!newTargetCell) {
        return grid;
      }
      if (target) {
        const targetCell: ?Cell = grid.getIn(target);
        if (!targetCell) {
          return grid;
        }
        const cellReset: Cell = targetCell.merge(
          Map({ updated: false, distance: -1, obstacle: false })
        );
        grid = grid.setIn(target, cellReset);
      }

      const targetSet: Cell = newTargetCell.merge(
        Map({ distance: 0, updated: true, obstacle: false })
      );
      grid = grid.setIn(newTarget, targetSet);
      target = newTarget;
      return grid.toJS();
    },
    getTarget(): ?Position {
      return target;
    },
    updateDistance(): Grid {
      if (!target || target.length !== 2) {
        return grid.toJS();
      }
      grid = grid.map((row: List<Cell>): List<Cell> =>
        row.map((cell: Cell): Cell => {
          const isItTheTarget: boolean = cell.get('distance') === 0;
          const isItAnObstacle: boolean = cell.get('obstacle');
          return isItAnObstacle || isItTheTarget
            ? cell
            : cell.set('updated', false);
        })
      );
      let distance: number = 1;
      let tilesToUpdate: List<Position> = List();
      tilesToUpdate = tilesToUpdate.push(target);
      console.time('1');
      do {
        const neighbours: List<Position> = tilesToUpdate
          .map((position: Position): List<Position> => {
            return List(utils.getNeighbours(position, outOfBounds, grid));
          })
          .flatten();

        tilesToUpdate = tilesToUpdate.clear();
        neighbours.forEach((position: Position): void => {
          const cell = grid.getIn(position);
          if (cell && !cell.get('updated')) {
            grid = grid.setIn(
              position,
              cell.merge(Map({ distance, updated: true }))
            );
            tilesToUpdate = tilesToUpdate.push(position);
          }
        });
        distance = distance + 1;
      } while (tilesToUpdate.size > 0);
      console.timeEnd('1');
      return grid.toJS();
    },
    updateVectorField(): Grid {
      if (!target) {
        return grid.toJS();
      }
      console.time('2');
      let newGrid: Grid = grid.map((row, i) => {
        return row.map((cell, j) => {
          if (cell.get('distance') === 0 || cell.get('obstacle')) {
            return cell;
          }
          //Vector from current cell to Target
          const toTarget: Array<number> = [target[0] - i, target[1] - j];

          //Get All neightbours for current cell
          let neighbours: Array<Cell> = utils
            .getNeighbours([i, j], outOfBounds, grid)
            .map((position: Position): Object => ({
              cell: grid.getIn(position),
              position
            }))
            .filter((props: Object): boolean => !props.cell.get('obstacle'));

          //Get minimum distance
          let minimumDistance: number = minBy(
            neighbours,
            (props: Object): number => props.cell.get('distance')
          ).cell.get('distance');

          //Get only cell with their distance equals to minimum
          const validNeighbours = neighbours
            .filter(
              (props: Object) => props.cell.get('distance') === minimumDistance
            )
            //Calculate heading to target from each possible cell
            .map(({ cell, position }) => {
              const toLocalTarget: Array<number> = [
                position[0] - i,
                position[1] - j
              ];
              const dot: number =
                toTarget[0] * toLocalTarget[0] + toTarget[1] * toLocalTarget[1];
              const cross: number =
                toTarget[0] * toLocalTarget[1] - toTarget[1] * toLocalTarget[0];

              return [Math.abs(Math.atan(cross / dot)), position];
            });

          const cellWithBestHeadingToTarget: Position = minBy(
            validNeighbours,
            ([angle, position]) => angle
          )[1];
          return cell.set('direction', [
            cellWithBestHeadingToTarget[0] - i,
            cellWithBestHeadingToTarget[1] - j
          ]);
        });
      });
      grid = newGrid;
      console.timeEnd('2');
      return grid.toJS();
    }
  };
}
