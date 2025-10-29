// <copyright file="settings.mjs" company="alterNERDtive">
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

export class ModuleSettings {

  static init() {
    ModuleSettings._chatSettings();
  }

  static _chatSettings() {
    game.settings.register(MODULE, "allowTarget", {
      name: "EFFECTIVETRAY.AllowTargetSettingName",
      hint: "EFFECTIVETRAY.AllowTargetSettingHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: true,
      onChange: false
    });

    game.settings.register(MODULE, "damageTarget", {
      name: "EFFECTIVETRAY.DamageTargetSettingName",
      hint: "EFFECTIVETRAY.DamageTargetSettingHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: true,
      onChange: false
    });

    game.settings.register(MODULE, "deleteInstead", {
      name: "EFFECTIVETRAY.DeleteInsteadSettingName",
      hint: "EFFECTIVETRAY.DeleteInsteadSettingHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: false,
      onChange: false
    });

    game.settings.register(MODULE, "ignoreNPC", {
      name: "EFFECTIVETRAY.IgnoreNPCSettingName",
      hint: "EFFECTIVETRAY.IgnoreNPCSettingHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: true,
      onChange: false
    });

    game.settings.register(MODULE, "filterPermission", {
      name: "EFFECTIVETRAY.FilterPermissionSettingName",
      hint: "EFFECTIVETRAY.FilterPermissionSettingHint",
      scope: "world",
      config: true,
      type: Number,
      default: 0,
      requiresReload: true,
      choices: {
        0: "EFFECTIVETRAY.NoFilter",
        1: "OWNERSHIP.LIMITED",
        2: "OWNERSHIP.OBSERVER",
        3: "OWNERSHIP.OWNER",
        4: "EFFECTIVETRAY.GmOnly"
      }
    });

    game.settings.register(MODULE, "filterDisposition", {
      name: "EFFECTIVETRAY.FilterDispositionSettingName",
      hint: "EFFECTIVETRAY.FilterDispositionSettingHint",
      scope: "world",
      config: true,
      type: Number,
      default: 0,
      requiresReload: true,
      choices: {
        0: "EFFECTIVETRAY.NoFilter",
        1: "TOKEN.DISPOSITION.SECRET",
        2: "TOKEN.DISPOSITION.HOSTILE",
        3: "TOKEN.DISPOSITION.NEUTRAL"
      }
    });

    game.settings.register(MODULE, "multipleConcentrationEffects", {
      name: "EFFECTIVETRAY.MultipleConcentrationEffectsSettingName",
      hint: "EFFECTIVETRAY.MultipleConcentrationEffectsSettingHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: false,
      onChange: false
    });

    game.settings.register(MODULE, "systemDefault", {
      name: "EFFECTIVETRAY.SystemDefaultSettingName",
      hint: "EFFECTIVETRAY.SystemDefaultSettingHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: true,
      onChange: false
    });

    game.settings.register(MODULE, "damageDefault", {
      name: "EFFECTIVETRAY.DamageDefaultSettingName",
      hint: "EFFECTIVETRAY.DamageDefaultSettingHint",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
      requiresReload: true,
      onChange: false
    });
  }
}
