const ColorPicker = ({ selectedColor, setSelectedColor }: { selectedColor: string, setSelectedColor: React.Dispatch<React.SetStateAction<string>> }) => {

    const colors = [
        { value: 'red', name: 'Red' },
        { value: 'blue', name: 'Blue' },
        { value: 'yellow', name: 'Yellow' },
        { value: 'black', name: 'Black' },
        { value: 'purple', name: 'Purple' },
    ];

    return (
        <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-700">Brush Color</label>
            <div className="flex items-center space-x-3">
                {colors.map((color) => (
                    <div key={color.value} className="relative">
                        <input
                            type="radio"
                            id={color.value}
                            name="color"
                            value={color.value}
                            checked={selectedColor === color.value}
                            onChange={() => setSelectedColor(color.value)}
                            className="sr-only"
                            aria-checked={selectedColor === color.value}
                        />

                        <label
                            htmlFor={color.value}
                            style={{ backgroundColor: color.value }}
                            className={`block w-6 h-6 rounded-full cursor-pointer transition-all ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''} hover:scale-110`}
                            title={color.name}
                            aria-label={color.name}
                        >
                            {selectedColor === color.value && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ColorPicker;