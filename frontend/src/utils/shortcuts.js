export const setupShortcuts = (shortcuts) => {
    const handleKeyDown = (event) => {
        const activeElement = document.activeElement;
        const fullCode = `${event.shiftKey ? 'Shift+' : ''}${event.code}`;
        const shortcut = shortcuts.find(s => s.codes.includes(fullCode) && (s.isActive ? s.isActive(activeElement) : true));

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
