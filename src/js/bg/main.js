/**
 * Entry of background scripts
 * Run in the background whenever Chrome starts.
 * Used to register listeners to Chrome events.
 */

import { createDefaultAchievements } from 'bg/Achievement';
import { setupConnections, send } from 'bg/connection';
import { PORT_PU, BG_A_ALL } from 'shared/constant';

Promise.all(createDefaultAchievements().map(a => a.load())).then(achievements =>
  setupConnections(() => {
    send(PORT_PU, BG_A_ALL, achievements.map(a => a.shownData));
  })
);
