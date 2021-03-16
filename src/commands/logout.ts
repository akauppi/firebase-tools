import { Command } from "../command";
import { logger } from "../logger";
import * as clc from "cli-color";

import * as utils from "../utils";
import * as auth from "../auth";

module.exports = new Command("logout [email]")
  .description("log the CLI out of Firebase")
  .action(async (email: string | undefined, options: any) => {
    const globalToken = utils.getInheritedOption(options, "token") as string | undefined;

    const allAccounts = auth.getAllAccounts();
    if (allAccounts.length === 0 && !globalToken) {
      logger.info("No need to logout, not logged in");
      return;
    }

    const accountsToLogOut = email
      ? allAccounts.filter((a) => a.user.email === email)
      : allAccounts;

    if (email && accountsToLogOut.length === 0) {
      utils.logWarning(`No account matches ${email}, can't log out.`);
      return;
    }

    for (const account of accountsToLogOut) {
      const token = account.tokens.refresh_token;

      if (token) {
        auth.setRefreshToken(token);
        try {
          await auth.logout(token);
        } catch (e) {
          utils.logWarning(
            `Invalid refresh token for ${account.user.email}, did not need to deauthorize`
          );
        }

        utils.logSuccess(`Logged out from ${clc.bold(account.user.email)}`);
      }
    }

    if (globalToken) {
      auth.setRefreshToken(globalToken);
      try {
        await auth.logout(globalToken);
      } catch (e) {
        utils.logWarning("Invalid refresh token, did not need to deauthorize");
      }

      utils.logSuccess(`Logged out from token "${clc.bold(globalToken)}"`);
    }
  });
