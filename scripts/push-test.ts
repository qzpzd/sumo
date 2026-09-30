import { loadEnvFile } from "../lib/env";
import { sendConnectivityPing } from "../lib/push";

loadEnvFile();

const result = await sendConnectivityPing();
if (!result.ok) {
  console.error(result.error || "推送测试失败");
  process.exit(1);
}
console.log(result.reason);
