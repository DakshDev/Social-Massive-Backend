export type PostSizeType = "square" | "portrait" | "landscape";

export default function getPostSize(size: PostSizeType) {
  if (size === "square") {
    return { w: 1080, h: 1080 };
  }
  if (size === "portrait") {
    return { w: 1080, h: 1350 };
  }
  if (size === "landscape") {
    return { w: 1080, h: 608 };
  }
}
