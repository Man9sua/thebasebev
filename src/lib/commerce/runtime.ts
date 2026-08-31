import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  D1CommerceRepository,
  type D1DatabaseLike,
} from "./d1-repository";

export async function getCommerceRepository() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const database = (env as CloudflareEnv & { COMMERCE_DB?: D1DatabaseLike })
      .COMMERCE_DB;
    return database ? new D1CommerceRepository(database) : null;
  } catch {
    return null;
  }
}
