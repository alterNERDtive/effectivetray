// <copyright file="effective-tray.mjs" company="alterNERDtive">
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

import { MODULE } from "./const.mjs";
import EffectiveDamageApplication from "./damage-application.mjs";
import EffectiveEffectApplication from "./effect-application.mjs";

export class EffectiveTray {
  static init() {

    // Modify the damage tray
    if (!game.settings.get(MODULE, "damageDefault")) {
      EffectiveDamageApplication.init();
    }

    // Modify the effects tray
    if (!game.settings.get(MODULE, "systemDefault")) {
      EffectiveEffectApplication.init();
    }

    // Add dependent effect to a concentration effect.
    Hooks.on("createActiveEffect", EffectiveTray.#addDependent);

    // Misc
    Hooks.on("preCreateActiveEffect", EffectiveTray._enchantmentSpellLevel);
  }

  /**
   * When an effect is created, if a specific user id and concentration uuid is passed,
   * add the created effect as a dependent on the concentration effect.
   * @param {ActiveEffect5e} effect     The effect that was created.
   * @param {object} operation          The creation context.
   */
  static async #addDependent(effect, operation) {
    const { userId, concentrationUuid } = operation.effectiv ?? {};
    if (game.user.id !== userId) return;
    const concentration = await fromUuid(concentrationUuid);
    if (concentration) concentration.addDependent(effect);
  }

  /**
   * Scroll tray to bottom if at bottom
   * @param {string} mid The message id.
   */
  static async _scroll(mid, delay) {
    if (delay) new Promise(r => setTimeout(r, 10));
    if (mid !== game.messages.contents.at(-1).id) return;
    if (window.ui.chat.isAtBottom) {
      await new Promise(r => setTimeout(r, 256));
      window.ui.chat.scrollBottom({ popout: false });
    };
    if (window.ui.sidebar.popouts.chat && window.ui.sidebar.popouts.chat.isAtBottom) {
      await new Promise(r => setTimeout(r, 256));
      window.ui.sidebar.popouts.chat.scrollBottom();
    };
  }

  /* -------------------------------------------- */
  /*  Effect Handling                             */
  /* -------------------------------------------- */

  /**
   * Apply effect, or refresh its duration (and level) if it exists
   * @param {Actor5e} actor                          The actor to create the effect on.
   * @param {ActiveEffect5e} effect                  The effect to create.
   * @param {object} [options]                       Additional data that may be included with the effect.
   * @param {object} [options.effectData]            A generic data object that contains spellLevel in a `dnd5e` scoped flag, and whatever else.
   * @param {ActiveEffect5e} [options.concentration] The concentration effect on which `effect` is dependent, if it requires concentration.
   */
  static async applyEffectToActor(effect, actor, { effectData, concentration }) {
    const origin = game.settings.get(MODULE, "multipleConcentrationEffects") ? effect : concentration ?? effect;

    // Enable an existing effect on the target if it originated from this effect
    const existingEffect = game.settings.get(MODULE, "multipleConcentrationEffects") ?
      actor.effects.find(e => e.origin === effect.uuid) :
      actor.effects.find(e => e.origin === origin.uuid);

    if (existingEffect) {
      if (!game.settings.get(MODULE, "deleteInstead")) {
        return existingEffect.update(foundry.utils.mergeObject({
          ...effect.constructor.getInitialDuration(),
          disabled: false
        }, effectData));

        // Or delete it instead
      } else existingEffect.delete();
    } else {

      // Otherwise, create a new effect on the target
      effect instanceof ActiveEffect ? effect = effect.toObject() : effect;
      effectData = foundry.utils.mergeObject({
        ...effect,
        disabled: false,
        transfer: false,
        origin: origin.uuid
      }, effectData);

      // Handle calling the pre hook
      const hookData = EffectiveTray._hookHandler(effectData, actor, concentration);
      if (hookData === false) return;
      effectData = hookData;

      // Find an owner of the concentration effect and request that they add the dependent effect.
      const context = { parent: actor };
      if (concentration && !concentration.isOwner) {
        const userId = game.users.find(u => u.active && concentration.testUserPermission(u, "OWNER"))?.id;
        if (userId) context.effectiv = { userId: userId, concentrationUuid: concentration.uuid };
      }
      const applied = await ActiveEffect.implementation.create(effectData, context);
      if (concentration && concentration.isOwner) await concentration.addDependent(applied);

      // Call the post hook
      Hooks.callAll("effectiv.applyEffect", effectData, actor, concentration);

      return applied;
    };
  }

  // Synchronous hook handling
  static _hookHandler(effectData, actor, concentration) {
    const callback = Hooks.call("effectiv.preApplyEffect", effectData, actor, concentration);
    if (callback === false) return false;
    return effectData;
  }

  /* -------------------------------------------- */
  /*  Damage Handling                             */
  /* -------------------------------------------- */

  /**
   * Apply damage
   * @param {string} id       The id of the actor to apply damage to.
   * @param {object} options  The options provided by the tray, primarily the multiplier.
   * @param {Array<Record<string, unknown>|Set<unknown>>} damage An array of objects with the damage type and 
   *                                                             value that also contain Sets with damage properties.
   */
  static async applyTargetDamage(id, options, damage) {
    const actor = fromUuidSync(id);
    await actor.applyDamage(damage, options);
  }

  /* -------------------------------------------- */
  /*  Misc. Methods                               */
  /* -------------------------------------------- */

  /**
   * Before an effect is created, if it is an enchantment from a spell,
   * add a flag indicating the level of the spell.
   * @param {ActiveEffect5e} effect           The effect that will be created.
   * @param {object} data                     The initial data object provided to the request.
   * @param {DatabaseCreateOperation} options Additional options which modify the creation request.
   */
  static _enchantmentSpellLevel(effect, data, options) {
    if (!effect.isAppliedEnchantment) return;
    const msg = game.messages.get(options.chatMessageOrigin);
    const lvl = msg.flags?.dnd5e?.use?.spellLevel;
    if (!lvl) return;
    let spellLevel;
    if (lvl === 0) spellLevel = 0;
    else spellLevel = parseInt(lvl) || null;
    const flags = effect.flags.dnd5e;
    const newFlags = foundry.utils.mergeObject(flags, { "spellLevel": spellLevel });
    effect.updateSource({ "flags.dnd5e": newFlags });
  }

  /**
   * Check targets for ownership when determining which target selection mode to use.
   * @param {Array} targets  Array of objects with target data, including UUID.
   * @returns {boolean}
   */
  static ownershipCheck(targets) {
    if (!targets) return false;
    for (const target of targets) {
      const actor = fromUuidSync(target.uuid);
      if (actor?.isOwner) return true;
      else continue;
    };
    return false;
  }

  /**
   * Sort tokens into owned and unowned categories.
   * @param {Set|Token[]} targets The set or array of tokens to be sorted.
   * @returns {Array}             An Array of length two whose elements are the partitioned pieces of the original
   */
  static partitionTargets(targets) {
    const result = targets.reduce((acc, t) => {
      if (t.isOwner) acc[0].push(t);
      else acc[1].push(t.document.uuid);
      return acc;
    }, [[], []]);
    return result;
  }
}
