/**
 * Entry of background scripts
 * Run in the background whenever Chrome starts.
 * Used to register listeners to Chrome events.
 */

import {
  createDefaultAchievements,
  resetAllAchievements,
} from 'BG/Achievement';
import { onConnect, send } from 'BG/connection';
import { RELEASE, PORT_PU, BG_A_ALL } from 'shared/constant';

Promise.all(createDefaultAchievements().map(a => a.load())).then(
  achievements => {
    if (!RELEASE) {
      window.resetAllAchievements = resetAllAchievements;
      window.achievements = achievements;
    }

    onConnect(port => {
      switch (port.name) {
        case PORT_PU:
          send(PORT_PU, BG_A_ALL, achievements.map(a => a.shownData));
          break;
      }
    });
  }
);
