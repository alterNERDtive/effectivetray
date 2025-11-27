// <copyright file="effect-application.mjs" company="alterNERDtive">
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

import { MODULE, SOCKET_ID } from "./const.mjs";
import { EffectiveTray } from "./effective-tray.mjs";

/* -------------------------------------------- */
/*  Effect Application Extension (from dnd5e)   */
/*  Refer to dnd5e for full documentation       */
/* -------------------------------------------- */

export default class EffectiveEffectApplication {
  static init() {
    /**
     * Override the display of the effects tray with effects the user can apply.
     * Refer to dnd5e for full documentation.
     * @param {HTMLLiElement} html  The chat card.
     * @protected
     */
    libWrapper.register("effectivetray-ng", "dnd5e.documents.ChatMessage5e.prototype._enrichUsageEffects", function(html) {
      const item = this.getAssociatedItem();

      // Additional effect detection
      let effects;
      if (this.getFlag("dnd5e", "messageType") === "usage") {
        effects = this?.getFlag("dnd5e", "use.effects")?.map(id => item?.effects.get(id))
      } else {
        if (this.getFlag("dnd5e", "roll.type")) return;
        effects = item?.effects.filter(e => (e.type !== "enchantment") && !e.getFlag("dnd5e", "rider"));
      }
      if (!effects?.length || foundry.utils.isEmpty(effects)) return;
      if (!effects.some(e => e.type !== "enchantment")) return;

      // Handle filtering based on actor
      const actor = this.getAssociatedActor();
      if (game.settings.get(MODULE, "ignoreNPC") && actor?.type === "npc" && !actor?.isOwner) return;
      const filterDis = game.settings.get(MODULE, "filterDisposition");
      if (filterDis) {
        const token = game.scenes?.get(this.speaker?.scene)?.tokens?.get(this.speaker?.token);
        if (token && filterDis === 3 && token.disposition <= CONST.TOKEN_DISPOSITIONS.NEUTRAL && !token?.isOwner) return;
        else if (token && filterDis === 2 && token.disposition <= CONST.TOKEN_DISPOSITIONS.HOSTILE && !token?.isOwner) return;
        else if (token && filterDis === 1 && token.disposition <= CONST.TOKEN_DISPOSITIONS.SECRET && !token?.isOwner) return;
      }
      const filterPer = game.settings.get(MODULE, "filterPermission");
      if (filterPer) {
        if (filterPer === 1 && !actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED)) return;
        else if (filterPer === 2 && !actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)) return;
        else if (filterPer === 3 && !actor?.isOwner) return;
        else if (filterPer === 4 && !game.user.isGM) return;
      }

      const effectApplication = document.createElement("effect-application");
      effectApplication.effects = effects;
      return html.querySelector(".message-content").appendChild(effectApplication);
    }, libWrapper.OVERRIDE);

    /**
     * Handle applying an Active Effect to a Token.
     * @param {ActiveEffect5e} effect      The effect to apply.
     * @param {Actor5e} actor              The actor.
     * @returns {Promise<ActiveEffect5e>}  The created effect.
     * @protected
     */
    libWrapper.register("effectivetray-ng", "dnd5e.applications.components.EffectApplicationElement.prototype._applyEffectToActor", function(effect, actor, { effectData, concentration }) {
      const applied = EffectiveTray.applyEffectToActor(effect, actor, { effectData, concentration });
      return applied;
    }, libWrapper.OVERRIDE)

    libWrapper.register("effectivetray-ng", "dnd5e.applications.components.EffectApplicationElement.prototype.buildTargetListEntry", function({ uuid, name}) {
      // Override checking isOwner
      const actor = fromUuidSync(uuid);
      if (!game.settings.get(MODULE, "allowTarget") && !actor?.isOwner) return;

      const disabled = this.targetingMode === "selected" ? " disabled" : "";
      const checked = this.targetChecked(uuid) ? " checked" : "";

      const li = document.createElement("li");
      li.classList.add("target");
      li.dataset.targetUuid = uuid;
      li.innerHTML = `
        <img class="gold-icon">
        <div class="name-stacked">
          <span class="title"></span>
        </div>
        <div class="checkbox">
          <dnd5e-checkbox name="${uuid}"${checked}${disabled}></dnd5e-checkbox>
        </div>
      `;
      Object.assign(li.querySelector(".gold-icon"), { alt: name, src: actor.img });
      li.querySelector(".name-stacked .title").append(name);

      return li;
    }, libWrapper.OVERRIDE)

    libWrapper.register("effectivetray-ng", "dnd5e.applications.components.EffectApplicationElement.prototype.connectedCallback", function(wrapped) {
      wrapped();

      // Override to hide target selection if there are no targets
      if (!game.settings.get(MODULE, "allowTarget") && !game.user.isGM) {
        const targets = this.chatMessage.getFlag("dnd5e", "targets");
        const ownership = EffectiveTray.ownershipCheck(targets);
        if (!ownership) this.targetSourceControl.hidden = true;
      };
    }, libWrapper.WRAPPER);

    /**
     * Handle clicking the apply effect button.
     * @param {PointerEvent} event  Triggering click event.
     * @throws {Error}              If the effect could not be applied.
     */
    libWrapper.register("effectivetray-ng", "dnd5e.applications.components.EffectApplicationElement.prototype._onApplyEffect", async function(event) {
      event.preventDefault();
      const effect = this.chatMessage.getAssociatedItem()?.effects.get(event.target.closest("[data-id]")?.dataset.id);
      if (!effect) return;
      const concentration = this.chatMessage.getAssociatedActor()?.effects
        .get(this.chatMessage.getFlag("dnd5e", "use.concentrationId"));
      const origin = concentration ?? effect;

      // Override to accomodate helper params
      const effectData = {
        flags: {
          dnd5e: {
            dependentOn: origin.uuid,
            scaling: this.chatMessage.getFlag("dnd5e", "scaling"),
            spellLevel: this.chatMessage.getFlag("dnd5e", "use.spellLevel")
          }
        }
      };

      const unownedTargets = [];
      for (const target of this.targetList.querySelectorAll("[data-target-uuid]")) {
        const actor = fromUuidSync(target.dataset.targetUuid);
        if (!actor || !target.querySelector("dnd5e-checkbox")?.checked) continue;
        try {
          if (actor.isOwner) {
            this._applyEffectToActor(effect, actor, { effectData, concentration });
          } else {
            if (game.settings.get(MODULE, 'allowTarget')) unownedTargets.push(target.dataset.targetUuid);
          }
        } catch (err) {
          Hooks.onError("EffectiveEffectApplication._applyEffectToToken", err, { notify: "warn", log: "warn" });
        }
      }

      if ( game.settings.get("dnd5e", "autoCollapseChatTrays") !== "manual" ) {
        this.querySelector(".collapsible").dispatchEvent(new PointerEvent("click", { bubbles: true, cancelable: true }));
      }

      // Unowned targets handling
      if (!game.settings.get(MODULE, 'allowTarget')) return;
      if (!game.users.activeGM) return ui.notifications.warn(game.i18n.localize("EFFECTIVETRAY.NOTIFICATION.NoActiveGMEffect"));
      const source = effect.uuid;
      const con = concentration?.id;
      const caster = this.chatMessage.getAssociatedActor().uuid;
      await game.socket.emit(SOCKET_ID, { type: "effect", data: { source, targets: unownedTargets, effectData, con, caster } });
    }, libWrapper.OVERRIDE);
  }
}
