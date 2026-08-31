# ADR 005: Phosphor icon "Icon" postfix is required

Phosphor icons are exported with an `Icon` suffix (e.g., `ArrowLeftIcon`,
`SunIcon`). The bare name (`ArrowLeft`) is also exported but is a deprecated
alias. Mixing the two styles across the codebase creates inconsistency and
confusion about which form to use in new code.

Always import and use Phosphor icons with the `Icon` postfix. Omitting the
postfix (`ArrowLeft` instead of `ArrowLeftIcon`) is deprecated and must not be
used in new code.
