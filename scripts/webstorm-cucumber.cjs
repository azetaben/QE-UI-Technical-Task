// WebStorm's Cucumber runner still injects the deprecated colorsEnabled option.
// Translate it before Cucumber parses argv, preserving the IDE formatter options.
for (let index = 2; index < process.argv.length; index++) {
    const argument = process.argv[index];
    const inline = argument.startsWith('--format-options=');
    if (argument !== '--format-options' && !inline) continue;
    const valueIndex = inline ? index : index + 1;
    const raw = inline ? argument.slice('--format-options='.length) : process.argv[valueIndex];
    let options;
    try {
        options = JSON.parse(raw);
    } catch {
        continue; // Let Cucumber report invalid JSON itself.
    }
    if (!options || typeof options.colorsEnabled !== 'boolean') continue;
    process.env.FORCE_COLOR ??= options.colorsEnabled ? '1' : '0';
    delete options.colorsEnabled;
    process.argv[valueIndex] = `${inline ? '--format-options=' : ''}${JSON.stringify(options)}`;
}
