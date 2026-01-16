# Effective Tray NG (for D&D Fifth Edition)

> [!IMPORTANT]
> This project has been moved to <https://git.alternerd.tv/Foundry-VTT/effectivetray>.

[![Please don't upload to GitHub](https://nogithub.codeberg.page/badge.svg)](https://nogithub.codeberg.page)

[![latest release](https://git.alternerd.tv/Foundry-VTT/effectivetray-ng/badges/release.svg?color=limegreen)](https://git.alternerd.tv/Foundry-VTT/effectivetray-ng/releases/latest)
![Foundry v13](https://img.shields.io/badge/Foundry-v13-informational?logo=foundryvirtualtabletop)
![D&D 5e 5.2](https://img.shields.io/badge/D%26D%205e-5.2-informational?logo=dungeonsanddragons)
[![Discord](https://img.shields.io/discord/385315806323408937?logo=discord&label=Discord)](https://discord.alternerd.tv)

A module for D&D5e on Foundry VTT that allows players to make full use of the effects and damage trays, instead of restricting them to DM only.

Based on [Effective Tray](https://github.com/etiquettestartshere/effectivetray) by [@etiquettestartshere](https://github.com/etiquettestartshere).

## Effects Tray 
Allows users to use the effect tray as much or as little as wanted by the GM, up to and including transferal to targets they do not own. User ability to transfer effects to and from any target is on by default.

## Damage Tray
Allows users to use the damage tray for selected tokens that they own, and for targeted tokens (either that they own, or ones they don't own with a setting). User ability to use the damage tray is on by default, but unless the relevant setting is selected, they cannot damage targets.

## Settings

- **Transfer to Target**: Allow users to transfer effects to targets they do not own (off by default).
- **Damage Target**: Allow users to damage targets that they don't own with the damage tray (off by default).
- **Delete Instead of Refresh**: Attempting to transfer an effect to an actor that has it already will delete it rather than refreshing its duration (off by default).
- **Filtering** based on actor type, permissions, and token disposition. This prevents users from seeing and interacting with effects of certain origins, depending on GM preference (no filtering is performed by default).
- **Multiple Effects with Concentration**: Allow multiple effects to be applied from spells with concentration (off by default).
- **Use Default Trays**: Adds settings (off by default) to use the default effects and damage trays. Only the features *below* this setting will function if a given tray is in its default mode.

## Additional Features
- Flags enchantment effects with their spellLevel.

___

## Technical Details

**Scope:** This module modifies the system’s damage and effect application trays in chat messages using [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper) to allows all users, not just GMs or the originating user, to apply effects and damage. Since regular users cannot directly affect unowned tokens, the module communicates changes via socket to an active GM client.

**License:** GPLv3. Original code base by etiquettestartshere: MIT.

**Additional Info:** Some code has been adapted from [dnd5e](https://github.com/foundryvtt/dnd5e), particularly the extension of the tray custom html elements, and unifying module and system logic for collapsing or expanding trays.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S1DLYBS)
