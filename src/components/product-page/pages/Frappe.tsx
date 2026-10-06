import type { ProductPageProps } from "../types";
import { BlendPage } from "./BlendPage";

export function FrappePage(props: ProductPageProps) {
  return <BlendPage {...props} kind="frappe" />;
}
