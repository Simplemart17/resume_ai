// Type declarations for importing CSS in TS/TSX files
// Keep module CSS with typed classes and allow side-effect global CSS imports

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.css";
