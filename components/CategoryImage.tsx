type CategoryImageProps = {
  imageUrl: string;
  className?: string;
};

export function CategoryImage({ imageUrl, className }: CategoryImageProps) {
  return <img className={className} src={imageUrl} alt="" aria-hidden="true" width={64} height={64} />;
}
