import { useRef } from "react";

type Props = {
  onSubmit: (text: string) => void;
  disabled: boolean;
};

export default function ItemForm({ onSubmit, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (disabled) return;

    const value = inputRef.current?.value as string;

    onSubmit(value);

    (inputRef.current as HTMLInputElement).value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <input
        ref={inputRef}
        type="text"
        spellCheck="false"
        required
        placeholder="Pridať položku..."
      />

      <button>Pridať</button>
    </form>
  );
}
