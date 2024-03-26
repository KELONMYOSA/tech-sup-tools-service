import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Tag} from 'antd';

const Category = ({category, onToggle}) => {
    return (
        <Tag
            color={category.selected ? 'blue' : 'default'}
            onClick={() => onToggle(category.key)}
            style={{cursor: 'pointer', margin: 5}}
        >
            {category.label}
        </Tag>
    );
};

const SearchModeSelector = forwardRef(({ initialCategories, onChange }, ref) => {
    const [categories, setCategories] = useState(initialCategories);

    useImperativeHandle(ref, () => ({
        setSelectedCategories: (selectedKeys) => {
            const newCategories = categories.map(category => ({
                ...category,
                selected: selectedKeys.includes(category.key),
            }));
            setCategories(newCategories);
            onChange(selectedKeys);
        },
    }));

    const handleToggle = (key) => {
        setCategories((currentCategories) => {
            let newCategories = [];
            let anySelected = false;

            if (key === 'all') {
                // Для 'Везде' просто обновляем текущее состояние, но не позволяем его отключить, если уже выбрано
                newCategories = currentCategories.map(category => ({
                    ...category,
                    selected: category.key === 'all' ? true : false,
                }));
                anySelected = true;
            } else {
                // Для остальных категорий сначала проверяем, есть ли уже выбранные категории
                const isCurrentlySelected = currentCategories.find(category => category.key === key).selected;
                newCategories = currentCategories.map(category => {
                    if (category.key === key) {
                        return {...category, selected: !isCurrentlySelected};
                    } else if (category.key === 'all') {
                        return {...category, selected: false}; // Отключаем 'Везде', если выбрана какая-то категория
                    }
                    return category;
                });

                // Проверяем, осталась ли какая-либо категория выбранной после изменения
                anySelected = newCategories.some(category => category.selected && category.key !== 'all');
                if (!anySelected) {
                    // Если ни одна категория не выбрана, выбираем 'Везде'
                    newCategories = newCategories.map(category => ({
                        ...category,
                        selected: category.key === 'all' ? true : false,
                    }));
                }
            }

            // Вызываем onChange с новым списком выбранных категорий
            const newSelectedKeys = newCategories.filter(category => category.selected).map(category => category.key);
            onChange(newSelectedKeys);

            return newCategories;
        });
    };

    return (
        <div style={{display: 'flex', flexWrap: 'wrap', padding: '10px'}}>
            {categories.map(category => (
                <Category key={category.key} category={category} onToggle={handleToggle}/>
            ))}
        </div>
    );
});

export default SearchModeSelector;
