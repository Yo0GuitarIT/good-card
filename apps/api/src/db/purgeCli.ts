import { purgeRevokedStamps, REVOKED_STAMP_RETENTION_DAYS } from "./purge";

purgeRevokedStamps()
  .then((count) => {
    console.log(
      `保留期限 ${REVOKED_STAMP_RETENTION_DAYS} 天，已刪除 ${count} 枚撤回的章`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
