export const setupShortcuts = (shortcuts) => {
    const handleKeyDown = (event) => {
        const code = event.code;
        const activeElement = document.activeElement;
        const shortcut = shortcuts.find(s => s.codes.includes(code) && (s.isActive ? s.isActive(activeElement) : true));

        if (shortcut) {
            event.preventDefault();
            shortcut.action(activeElement);
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
};
