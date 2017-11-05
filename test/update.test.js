var expect = require("expect");
var createFlowField = require("../FlowField2").default;
var { List } = require("immutable");

describe("FlowField", function() {
  const flowfield = createFlowField(1, 2, 2);

  describe("update", function() {
    it("should", function() {
      const FF = createFlowField(1, 4, 4);
      const grid = FF.getGrid();
      FF.setTarget([0, 0]);
      const newGrid = FF.updateDistance()
        .map(e => e.map(r => r.get("distance")))
        .toArray();
      expect(newGrid[0]).toEqual(List.of(0, 1, 2, 3));
      expect(newGrid[1]).toEqual(List.of(1, 1, 2, 3));
      expect(newGrid[2]).toEqual(List.of(2, 2, 2, 3));
      expect(newGrid[3]).toEqual(List.of(3, 3, 3, 3));
    });
    it("should update distances correctly when one adds obstacle", function() {
      const FF = createFlowField(1, 4, 4);
      const grid = FF.getGrid();
      FF.setTarget([1, 1]);
      FF.setObstacle([0, 0]);
      FF.setObstacle([2, 2]);
      const newGrid = FF.updateDistance()
        .map(e => e.map(r => r.get("distance")))
        .toArray();

      expect(newGrid[0]).toEqual(List.of(-1, 1, 1, 2));
      expect(newGrid[1]).toEqual(List.of(1, 0, 1, 2));
      expect(newGrid[2]).toEqual(List.of(1, 1, -1, 2));
      expect(newGrid[3]).toEqual(List.of(2, 2, 2, 3));
    });
  });
  it("should", function() {
    const FF = createFlowField(1, 10, 10);
    const grid = FF.getGrid();
    FF.setTarget([5, 5]);
    FF.setObstacle([2, 2]);
    FF.setObstacle([2, 3]);
    FF.setObstacle([2, 4]);

    const newGrid = FF.updateDistance()
      .map(e => e.map(r => r.get("distance")))
      .toArray();

    expect(newGrid[0]).toEqual(List.of(6, 6, 6, 5, 5, 5, 5, 5, 5, 5));
    expect(newGrid[1]).toEqual(List.of(5, 5, 5, 5, 4, 4, 4, 4, 4, 4));
    expect(newGrid[2]).toEqual(List.of(5, 4, -1, -1, -1, 3, 3, 3, 3, 4));
    expect(newGrid[3]).toEqual(List.of(5, 4, 3, 2, 2, 2, 2, 2, 3, 4));
    expect(newGrid[4]).toEqual(List.of(5, 4, 3, 2, 1, 1, 1, 2, 3, 4));
    expect(newGrid[5]).toEqual(List.of(5, 4, 3, 2, 1, 0, 1, 2, 3, 4));
    expect(newGrid[6]).toEqual(List.of(5, 4, 3, 2, 1, 1, 1, 2, 3, 4));
    expect(newGrid[7]).toEqual(List.of(5, 4, 3, 2, 2, 2, 2, 2, 3, 4));
    expect(newGrid[8]).toEqual(List.of(5, 4, 3, 3, 3, 3, 3, 3, 3, 4));
    expect(newGrid[9]).toEqual(List.of(5, 4, 4, 4, 4, 4, 4, 4, 4, 4));
  });
  it("should", function() {
    const FF = createFlowField(1, 10, 10);
    const grid = FF.getGrid();
    FF.setTarget([5, 5]);
    FF.setObstacle([2, 2]);
    FF.setObstacle([2, 3]);
    FF.setObstacle([2, 4]);
    FF.setObstacle([5, 7]);
    FF.setObstacle([6, 7]);
    FF.setObstacle([7, 7]);
    FF.setObstacle([8, 7]);

    const updatedGrid = FF.updateDistance()
      .map(e => e.map(r => r.get("distance")))
      .toArray();

    expect(updatedGrid[0]).toEqual(List.of(6, 6, 6, 5, 5, 5, 5, 5, 5, 5));
    expect(updatedGrid[1]).toEqual(List.of(5, 5, 5, 5, 4, 4, 4, 4, 4, 4));
    expect(updatedGrid[2]).toEqual(List.of(5, 4, -1, -1, -1, 3, 3, 3, 3, 4));
    expect(updatedGrid[3]).toEqual(List.of(5, 4, 3, 2, 2, 2, 2, 2, 3, 4));
    expect(updatedGrid[4]).toEqual(List.of(5, 4, 3, 2, 1, 1, 1, 2, 3, 4));
    expect(updatedGrid[5]).toEqual(List.of(5, 4, 3, 2, 1, 0, 1, -1, 3, 4));
    expect(updatedGrid[6]).toEqual(List.of(5, 4, 3, 2, 1, 1, 1, -1, 4, 4));
    expect(updatedGrid[7]).toEqual(List.of(5, 4, 3, 2, 2, 2, 2, -1, 5, 5));
    expect(updatedGrid[8]).toEqual(List.of(5, 4, 3, 3, 3, 3, 3, -1, 5, 6));
    expect(updatedGrid[9]).toEqual(List.of(5, 4, 4, 4, 4, 4, 4, 4, 5, 6));
  });
});
