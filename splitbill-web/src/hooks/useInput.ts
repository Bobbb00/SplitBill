import { useState } from "react";

export function useInput(initialValue: string, onValueChange?: () => void) {
    const [value, setValue] = useState(initialValue);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(e.target.value)

        if (onValueChange) {
            onValueChange()
        }
    }

    return {
        value,
        onChange,
        setValue,
    };
}