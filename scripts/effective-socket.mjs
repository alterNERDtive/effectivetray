// <copyright file="effective-socket.mjs" company="alterNERDtive">
// Copyright 2025 alterNERDtive.
//
// This file is part of the Effective Tray NG Foundry module.
//
// The Effective Tray NG Foundry module is free software: you can distribute
// it and/or modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of the License,
// or (at your option) any later version.
//
// The EffectiveTray NG Foundry module is distributed in the hope that it will
// be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with
// the EffectiveTray NG Foundry module.  If not, see
// &lt;https://www.gnu.org/licenses/&gt;.
// </copyright>

import { SOCKET_ID } from "./const.mjs";
import { EffectiveTray } from "./effective-tray.mjs";

/* -------------------------------------------- */
/*  Socket Handling                             */
/* -------------------------------------------- */

export class EffectiveSocket {

  /**
   * Register the socket
   * @param {object} request The information passed via socket to be handled by the GM client.
   */
  static init() {
    game.socket.on(SOCKET_ID, (request) => {
      switch (request.type) {
        case "effect":
          EffectiveSocket._effectSocket(request);
          break;
        case "damage":
          EffectiveSocket._damageSocket(request);
      };
    });
  }

  /**
   * Make the GM client apply effects to the requested targets.
   * @param {object} request The information passed via socket to be handled by the GM client.
   */
  static async _effectSocket(request) {
    if (game.user !== game.users.activeGM) return;
    const targets = request.data.targets;
    const source = request.data.source;
    const effect = foundry.utils.getType(source) === "string" ? await fromUuid(source) : source;
    const c = fromUuidSync(request.data.caster);
    const concentration = c?.effects?.get(request.data.con);
    const effectData = request.data.effectData;
    const actors = new Set();
    for (const target of targets) {
      const trg = fromUuidSync(target);
      const targetActor = trg.actor ?? trg;
      if (target) actors.add(targetActor);
    };
    for (const actor of actors) {
      await EffectiveTray.applyEffectToActor(effect, actor, { effectData, concentration });
    };
  }

  /**
   * Make the GM client apply damage to the requested targets
   * @param {object} request The information passed via socket to be handled by the GM client.
   */
  static async _damageSocket(request) {
    if (game.user !== game.users.activeGM) return;
    const id = request.data.id;
    const opts = request.data.opts;

    // Convert damage properties back into a Set for damage application
    const damage = [];
    request.data.damage.forEach(d => {
      foundry.utils.mergeObject(d, { properties: new Set(d.properties) });
      damage.push(d);
    });
    if (opts?.downgrade) foundry.utils.mergeObject(opts, { downgrade: new Set(opts.downgrade) });
    if (opts?.ignore?.immunity) foundry.utils.mergeObject(opts, { "ignore.immunity": new Set(opts.ignore.immunity) });
    if (opts?.ignore?.resistance) foundry.utils.mergeObject(opts, { "ignore.resistance": new Set(opts.ignore.resistance) });
    if (opts?.ignore?.vulnerability) foundry.utils.mergeObject(opts, { "ignore.vulnerability": new Set(opts.ignore.vulnerability) });
    if (opts?.ignore?.modification) foundry.utils.mergeObject(opts, { "ignore.modification": new Set(opts.ignore.modification) });
    return await EffectiveTray.applyTargetDamage(id, opts, damage);
  }
}
