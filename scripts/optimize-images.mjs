import sharp from "sharp";
import { mkdir } from "node:fs/promises";
await mkdir("public/products", { recursive: true });
await mkdir("public/images", { recursive: true });
for (const name of ["ro", "atm", "uf", "media", "tank", "dosing"])
  await sharp(`output/imagegen/${name}.png`)
    .resize(960)
    .webp({ quality: 86 })
    .toFile(`public/products/${name}.webp`);
for (const name of ["hero", "river", "maintenance"])
  await sharp(`output/imagegen/${name}.png`)
    .resize(name === "maintenance" ? 960 : 1920)
    .webp({ quality: 85 })
    .toFile(`public/images/${name}.webp`);
