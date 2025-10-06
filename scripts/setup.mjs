// <copyright file="setup.mjs" company="alterNERDtive">
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

import { ModuleSettings } from "./settings.mjs";
import { EffectiveTray } from "./effective-tray.mjs";
import { EffectiveSocket } from "./effective-socket.mjs";
import EffectiveEAE from "./effect-application.mjs";
import EffectiveDAE from "./damage-application.mjs";
import { API } from "./api.mjs";

window.customElements.define("effective-effect-application", EffectiveEAE);
window.customElements.define("effective-damage-application", EffectiveDAE);

Hooks.once("init", EffectiveSocket.init);
Hooks.once("init", ModuleSettings.init);
Hooks.once("init", EffectiveTray.init);
Hooks.once("init", API.init);
