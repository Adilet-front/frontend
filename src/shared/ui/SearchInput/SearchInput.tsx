import { useEffect, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchSuggestions } from "../../lib/search/useSearchSuggestions";
import styles from "./SearchInput.module.scss";

type SearchInputProps = {
  value: string;
  isAuthed: boolean;
  onSearch: (query: string) => void;
};

export const SearchInput = ({ value, isAuthed, onSearch }: SearchInputProps) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isAuthed) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }, [isAuthed]);

  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    isError: isSuggestionsError,
  } = useSearchSuggestions({
    term: inputValue,
    isAuthed,
    isActive: isOpen,
  });

  const handleSearch = (query: string) => {
    const normalized = query.trim();
    if (!normalized) {
      return;
    }
    onSearch(normalized);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isAuthed || !suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current >= suggestions.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[activeIndex];
      if (!selected) {
        return;
      }
      setInputValue(selected.query);
      onSearch(selected.query);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch(inputValue);
      }}
      onFocusCapture={() => {
        if (isAuthed) {
          setIsOpen(true);
        }
      }}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!event.currentTarget.contains(nextTarget)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <input
        type="search"
        value={inputValue}
        placeholder={t("search.placeholder")}
        onChange={(event) => {
          setInputValue(event.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />
      <button type="submit">{t("search.submitButton")}</button>

      {isOpen && isAuthed ? (
        <div className={styles.dropdown}>
          {isSuggestionsLoading ? (
            <p className={styles.status}>{t("search.suggestionsLoading")}</p>
          ) : isSuggestionsError ? (
            <p className={styles.status}>{t("search.suggestionsError")}</p>
          ) : suggestions.length ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                className={styles.item}
                data-active={index === activeIndex ? "true" : "false"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setInputValue(suggestion.query);
                  onSearch(suggestion.query);
                  setIsOpen(false);
                  setActiveIndex(-1);
                }}
              >
                <span className={styles.itemMain}>
                  <span className={styles.itemPrimary}>{suggestion.primary}</span>
                  <span className={styles.itemType}>
                    {suggestion.kind === "author"
                      ? t("search.suggestionTypeAuthor")
                      : t("search.suggestionTypeBook")}
                  </span>
                </span>
                <span className={styles.itemSecondary}>
                  {suggestion.kind === "author"
                    ? t("search.suggestionAuthorHint")
                    : suggestion.secondary}
                </span>
              </button>
            ))
          ) : (
            <p className={styles.status}>{t("search.suggestionsEmpty")}</p>
          )}
        </div>
      ) : null}
    </form>
  );
};
