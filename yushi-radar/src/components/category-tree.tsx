import { cn } from "@/lib/utils";
import { CATEGORIES, ROOT_CATEGORIES, childrenOf } from "@/lib/xianyu/categories";

export function CategoryTree({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string, name: string) => void;
}) {
  return (
    <nav className="space-y-1 text-sm">
      <button
        type="button"
        onClick={() => onChange("", "全部类目")}
        className={cn(
          "flex h-9 w-full items-center rounded-lg px-3 text-left",
          value === "" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
        )}
      >
        全部类目
      </button>
      {ROOT_CATEGORIES.map((root) => {
        const kids = childrenOf(root.id);
        const active = value === root.id || kids.some((k) => k.id === value);
        return (
          <div key={root.id}>
            <button
              type="button"
              onClick={() => onChange(root.id, root.name)}
              className={cn(
                "flex h-9 w-full items-center justify-between rounded-lg px-3 text-left",
                value === root.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <span>{root.name}</span>
              <span className="text-[10px] opacity-70">{kids.length || ""}</span>
            </button>
            {active && kids.length > 0 ? (
              <div className="mt-1 ml-3 space-y-0.5 border-l border-border pl-2">
                {kids.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => onChange(k.id, k.name)}
                    className={cn(
                      "flex h-8 w-full items-center rounded-md px-2 text-left text-[13px]",
                      value === k.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function CategorySelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (id: string, name: string) => void;
  className?: string;
}) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm",
        className,
      )}
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const cat = CATEGORIES.find((c) => c.id === id);
        onChange(id, cat?.name ?? "全部类目");
      }}
    >
      <option value="">全部类目</option>
      {ROOT_CATEGORIES.map((root) => {
        const kids = childrenOf(root.id);
        return (
          <optgroup key={root.id} label={root.name}>
            <option value={root.id}>{root.name}</option>
            {kids.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
