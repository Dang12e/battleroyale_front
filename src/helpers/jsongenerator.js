import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const COLS = 18;
const WIDTH = 90;
const HEIGHT = 90;

const idx = (row, col) => row * COLS + col;

// Các ô nền trên lưới 18x13 (điều chỉnh row, col theo đúng ảnh của bạn)
const SAND_TOP_LEFT = idx(4, 0);
const SAND_TOP_MID = idx(4, 1);
const SAND_TOP_RIGHT = idx(4, 2);

const SAND_FILL = [idx(5, 0), idx(5, 1), idx(5, 2)];

const PURPLE_BLOCK = [
  [idx(0, 0), idx(0, 1), idx(0, 2)],
  [idx(1, 0), idx(1, 1), idx(1, 2)],
  [idx(2, 0), idx(2, 1), idx(2, 2)]
];

const TEAL_BLOCK = [
  [idx(0, 5), idx(0, 6), idx(0, 7)],
  [idx(1, 5), idx(1, 6), idx(1, 7)],
  [idx(2, 5), idx(2, 6), idx(2, 7)]
];

export function buildGroundGrid({ width = WIDTH, height = HEIGHT } = {}) {
  return Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) => {
      if (row >= 15 && row < 27 && col >= 15 && col < 30) {
        return PURPLE_BLOCK[(row - 15) % 3][(col - 15) % 3];
      }
      if (row >= 40 && row < 55 && col >= 45 && col < 60) {
        return TEAL_BLOCK[(row - 40) % 3][(col - 45) % 3];
      }
      if (row === 0 || row === height - 1) {
        if (col === 0) return SAND_TOP_LEFT;
        if (col === width - 1) return SAND_TOP_RIGHT;
        return SAND_TOP_MID;
      }
      return SAND_FILL[(row + col) % SAND_FILL.length];
    })
  );
}

export function generateGroundJson(outputPath = 'ground.json', size = {}) {
  const grid = buildGroundGrid(size);
  const fullPath = resolve(outputPath);
  writeFileSync(fullPath, JSON.stringify(grid));
  return { path: fullPath, rows: grid.length, cols: grid[0].length };
}

// Chạy trực tiếp khi gọi: node generateGround.mjs
const isDirectRun = process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (isDirectRun) {
  const result = generateGroundJson('ground.json');
  console.log(`Xong ${result.path}: ${result.rows}x${result.cols}`);
}