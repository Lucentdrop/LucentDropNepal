import NextImage, { type ImageProps } from "next/image";
import { sitePath } from "@/lib/site-path";

export default function Image(props: ImageProps) {
  return (
    <NextImage
      {...props}
      src={typeof props.src === "string" ? sitePath(props.src) : props.src}
    />
  );
}
