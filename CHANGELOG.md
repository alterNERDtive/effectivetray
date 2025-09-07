# devel

* changed version scheme to include verified Foundry and 5e system versions (similar to https://github.com/thatlonelybugbear/automated-conditions-5e)
* no longer bypasses system performance improvements (#6)
* transfer effects (“apply effect to actor”) can now be applied via the tray; this includes applying to other actors
* new setting to allow applying transfer effects (“Apply Effect to Actor”) via the tray; this includes applying to other actors(!) (enabled by default)
* “Remove ‘Apply Effect to Actor’” setting now disabled by default

# 5.1.3 (2025-09-07)

* fixed damage application tray not showing for players (#5)

# 5.1.2 (2025-09-01)

* fixed settings not working for new module ID

# 5.1.1 (2025-09-01)

* changed module ID as requested by original author
* less aggressive fix for showing the target list

# 5.1.0 (2025-08-31)

* updated for D&D 5.1

This essentially reverts https://github.com/foundryvtt/dnd5e/pull/5842 and can lead to performance issues with long chat logs. You have been warned.
