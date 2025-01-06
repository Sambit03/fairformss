import { Form, FormElement, FormElementType } from "@/types/form";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function isMultipleChoiceElement(
  element: FormElement
): element is FormElement & {
  type: FormElementType.MULTIPLE_CHOICE;
  properties: {
    options: Array<{
      id: string;
      text: string;
      imageUrl?: string;
    }>;
    allowMultiple: boolean;
    randomizeOrder: boolean;
    allowOther: boolean;
  };
} {
  return element.type === FormElementType.MULTIPLE_CHOICE;
}

interface MultipleChoiceInputProps {
  element: FormElement;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  theme: Form["settings"]["theme"];
}

export function MultipleChoiceInput({
  element,
  value,
  onChange,
  theme,
}: MultipleChoiceInputProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset selectedId when value changes (like when going back)
  useEffect(() => {
    setSelectedId(null);
    setIsAnimating(false);
  }, [value]);

  if (!isMultipleChoiceElement(element)) return null;

  const handleOptionClick = (optionId: string) => {
    if (isAnimating) return;

    if (element.properties.allowMultiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(optionId)
        ? currentValue.filter((id) => id !== optionId)
        : [...currentValue, optionId];
      onChange(newValue);
    } else {
      setSelectedId(optionId);
      setIsAnimating(true);

      // Wait for animation to complete before triggering onChange
      setTimeout(() => {
        onChange(optionId);
      }, 750); // Total animation duration
    }
  };

  const isSelected = (optionId: string) => {
    if (element.properties.allowMultiple) {
      return Array.isArray(value) && value.includes(optionId);
    }
    return optionId === (selectedId ?? value);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.h2
          className="text-xl md:text-2xl font-medium leading-tight "
          style={{ color: theme.questionColor }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {element.question}
          {element.required && (
            <span
              style={{ color: theme.primaryColor }}
              className="text-primary ml-1"
            >
              *
            </span>
          )}
        </motion.h2>

        {element.description && (
          <motion.p
            className="text-base sm:text-lg"
            style={{ color: theme.textColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {element.description}
          </motion.p>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3">
        {element.properties.options.map((option, index) => {
          const isOptionSelected = isSelected(option.id);

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="touch-none"
            >
              <button
                onClick={() => handleOptionClick(option.id)}
                style={{
                  borderColor: isOptionSelected
                    ? theme.primaryColor
                    : `${theme.textColor}33`,
                  backgroundColor: isOptionSelected
                    ? `${theme.primaryColor}15`
                    : "transparent",
                }}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary/50 active:scale-[0.99]",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                disabled={isAnimating}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors duration-200"
                    style={{
                      borderColor: isOptionSelected
                        ? theme.primaryColor
                        : theme.textColor + "50",
                      backgroundColor: isOptionSelected
                        ? theme.primaryColor
                        : "transparent",
                    }}
                  >
                    {isOptionSelected && (
                      <div className="w-full h-full rounded-full bg-white scale-[0.4]" />
                    )}
                  </div>
                  <span
                    style={{ color: theme.questionColor }}
                    className="text-base sm:text-lg"
                  >
                    {option.text}
                  </span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
      {element.properties.allowMultiple && (
        <p className="text-sm text-muted-foreground">
          You can select multiple options
        </p>
      )}
    </div>
  );
}
