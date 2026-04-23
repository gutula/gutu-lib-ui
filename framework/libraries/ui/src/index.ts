import { format, formatDistanceToNowStrict, isValid } from "date-fns";
import React from "react";
import { toast as sonnerToast } from "sonner";

export const packageId = "ui" as const;
export const packageDisplayName = "UI" as const;
export const packageDescription = "Canonical admin UI wrapper surface over shared shell primitives." as const;

export * from "@platform/ui-kit";

type PlatformIconProps = React.SVGProps<SVGSVGElement> & {
  name?: PlatformIconName | undefined;
  size?: number | string | undefined;
};
type PlatformIconRenderer = (props: PlatformIconProps) => React.ReactNode;

const iconOverrides = new Map<string, PlatformIconRenderer>();

export type PlatformIconName = string;
export type PlatformToastIntent = "success" | "error" | "info" | "warning";
export type PlatformToastRecord = {
  title: string;
  description?: string | undefined;
  intent?: PlatformToastIntent | undefined;
};

export type PlatformToastDispatcher = (toast: PlatformToastRecord) => void;
export type PlatformToastController = {
  success(input: Omit<PlatformToastRecord, "intent">): void;
  error(input: Omit<PlatformToastRecord, "intent">): void;
  info(input: Omit<PlatformToastRecord, "intent">): void;
  warning(input: Omit<PlatformToastRecord, "intent">): void;
  show(input: PlatformToastRecord): void;
};

export type MemoryToastDispatcher = {
  history: PlatformToastRecord[];
  dispatch: PlatformToastDispatcher;
};

export function registerPlatformIcon(name: string, icon: PlatformIconRenderer): void {
  iconOverrides.set(name, icon);
}

export function resolvePlatformIcon(name?: PlatformIconName): PlatformIconRenderer | undefined {
  return name ? iconOverrides.get(name) : undefined;
}

function createIconElement(
  props: PlatformIconProps,
  children: React.ReactNode
) {
  const svgProps = {
    ...props
  };
  delete svgProps.name;
  delete svgProps.size;
  const size = props.size ?? 16;
  const color = props.color ?? "currentColor";
  const strokeWidth = props.strokeWidth ?? 1.8;
  return React.createElement(
    "svg",
    {
      ...svgProps,
      "aria-hidden": svgProps["aria-hidden"] ?? true,
      className: props.className,
      fill: "none",
      height: size,
      stroke: color,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth,
      style: props.style,
      viewBox: "0 0 24 24",
      width: size
    },
    children
  );
}

function renderPrimitiveIcon(name: string | undefined, props: PlatformIconProps) {
  const normalized = (name ?? "square").toLowerCase();
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    React.createElement("line", { x1, y1, x2, y2, key: `line-${x1}-${y1}-${x2}-${y2}` });
  const path = (d: string, key: string) => React.createElement("path", { d, key });
  const circle = (cx: number, cy: number, r: number, key: string) =>
    React.createElement("circle", { cx, cy, r, key });
  const rect = (x: number, y: number, width: number, height: number, rx: number, key: string) =>
    React.createElement("rect", { x, y, width, height, rx, key });

  if (normalized.includes("home") || normalized.includes("house")) {
    return createIconElement(props, [
      path("M4 11.5L12 5l8 6.5", "roof"),
      path("M6.5 10.5V19h11v-8.5", "house"),
      path("M10 19v-4.5h4V19", "door")
    ]);
  }

  if (normalized.includes("search")) {
    return createIconElement(props, [circle(11, 11, 5.5, "lens"), line(15.5, 15.5, 20, 20)]);
  }

  if (normalized.includes("bell")) {
    return createIconElement(props, [
      path("M7 9a5 5 0 0 1 10 0v5l1.5 2H5.5L7 14z", "bell"),
      path("M10 18a2 2 0 0 0 4 0", "clapper")
    ]);
  }

  if (normalized.includes("warning")) {
    return createIconElement(props, [
      path("M12 4l8 15H4L12 4z", "triangle"),
      line(12, 9, 12, 14),
      line(12, 17.25, 12, 17.25)
    ]);
  }

  if (normalized.includes("success") || normalized.includes("check")) {
    return createIconElement(props, [circle(12, 12, 8, "ring"), path("M8.5 12.5l2.5 2.5L16 10", "check")]);
  }

  if (normalized.includes("settings")) {
    return createIconElement(props, [
      circle(12, 12, 3.25, "gear-core"),
      line(12, 3.5, 12, 6.25),
      line(12, 17.75, 12, 20.5),
      line(3.5, 12, 6.25, 12),
      line(17.75, 12, 20.5, 12),
      line(6.2, 6.2, 8.15, 8.15),
      line(15.85, 15.85, 17.8, 17.8),
      line(15.85, 8.15, 17.8, 6.2),
      line(6.2, 17.8, 8.15, 15.85)
    ]);
  }

  if (normalized.includes("chart") || normalized.includes("report")) {
    return createIconElement(props, [
      line(5, 19, 19, 19),
      rect(6.5, 11.5, 2.5, 6, 0.75, "bar-1"),
      rect(10.75, 8.5, 2.5, 9, 0.75, "bar-2"),
      rect(15, 6, 2.5, 11.5, 0.75, "bar-3")
    ]);
  }

  if (normalized.includes("inbox")) {
    return createIconElement(props, [
      path("M4 8h16v9H15.5L13.5 20h-3L8.5 17H4z", "tray"),
      path("M4 12h4l1.5 2h5L16 12h4", "slot")
    ]);
  }

  if (normalized.includes("activity")) {
    return createIconElement(props, [path("M4 13h4l2-5 4 10 2-5h4", "pulse")]);
  }

  if (normalized.includes("users")) {
    return createIconElement(props, [
      circle(9, 10, 3, "user-a"),
      circle(16, 11, 2.5, "user-b"),
      path("M4.5 18.5c1.5-2.5 7.5-2.5 9 0", "group-a"),
      path("M13 18.5c1.1-1.8 4.9-1.9 6 0", "group-b")
    ]);
  }

  if (normalized.includes("cpu")) {
    return createIconElement(props, [
      rect(7, 7, 10, 10, 1.5, "chip"),
      rect(10, 10, 4, 4, 0.75, "chip-core"),
      line(9, 4, 9, 7),
      line(15, 4, 15, 7),
      line(9, 17, 9, 20),
      line(15, 17, 15, 20),
      line(4, 9, 7, 9),
      line(4, 15, 7, 15),
      line(17, 9, 20, 9),
      line(17, 15, 20, 15)
    ]);
  }

  if (normalized.includes("shield")) {
    return createIconElement(props, [
      path("M12 4l6 2.5V12c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8V6.5z", "shield"),
      path("M9.5 12.5l1.75 1.75L15 10.5", "shield-check")
    ]);
  }

  if (normalized.includes("wrench") || normalized.includes("tool")) {
    return createIconElement(props, [
      path("M14.5 5.5a3 3 0 0 0 3.75 3.75l-7 7-2.5.5.5-2.5 7-7a3 3 0 0 0-1.75-2.75z", "wrench")
    ]);
  }

  if (normalized.includes("layout") || normalized.includes("grid")) {
    return createIconElement(props, [
      rect(4.5, 5, 6, 6, 1, "grid-a"),
      rect(13.5, 5, 6, 6, 1, "grid-b"),
      rect(4.5, 13, 6, 6, 1, "grid-c"),
      rect(13.5, 13, 6, 6, 1, "grid-d")
    ]);
  }

  if (normalized.includes("help")) {
    return createIconElement(props, [circle(12, 12, 8, "help-ring"), path("M9.75 9.75a2.25 2.25 0 1 1 3.75 1.7c-.9.7-1.5 1.2-1.5 2.3", "help-q"), line(12, 17, 12, 17)]);
  }

  return createIconElement(props, [rect(5, 5, 14, 14, 2, "fallback-square")]);
}

export function PlatformIcon(props: PlatformIconProps) {
  const renderer = resolvePlatformIcon(props.name);
  if (renderer) {
    return renderer(props);
  }
  return renderPrimitiveIcon(props.name, props);
}

export function createMemoryToastDispatcher(initialHistory: PlatformToastRecord[] = []): MemoryToastDispatcher {
  const history = [...initialHistory];
  return {
    history,
    dispatch(toast) {
      history.push({
        ...toast
      });
    }
  };
}

export function createToastController(dispatch: PlatformToastDispatcher = dispatchPlatformToast): PlatformToastController {
  return {
    success(input) {
      dispatch({
        ...input,
        intent: "success"
      });
    },
    error(input) {
      dispatch({
        ...input,
        intent: "error"
      });
    },
    info(input) {
      dispatch({
        ...input,
        intent: "info"
      });
    },
    warning(input) {
      dispatch({
        ...input,
        intent: "warning"
      });
    },
    show(input) {
      dispatch(input);
    }
  };
}

export function dispatchPlatformToast(input: PlatformToastRecord): void {
  const message = input.description ? `${input.title}: ${input.description}` : input.title;
  if (input.intent === "success") {
    sonnerToast.success(message);
    return;
  }
  if (input.intent === "error") {
    sonnerToast.error(message);
    return;
  }
  if (input.intent === "warning") {
    sonnerToast.warning(message);
    return;
  }
  sonnerToast(message);
}

export function PlatformToaster(props: {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | undefined;
}) {
  return React.createElement("div", {
    "aria-hidden": true,
    "data-platform-toaster": props.position ?? "top-right",
    hidden: true
  });
}

export function ToastStack(props: {
  toasts: PlatformToastRecord[];
}) {
  if (props.toasts.length === 0) {
    return null;
  }

  return React.createElement(
    "div",
    {
      className: "awb-notice-list",
      "data-testid": "toast-stack"
    },
    props.toasts.map((toast, index) =>
      React.createElement(
        "section",
        {
          key: `${toast.title}:${index}`,
          className: "awb-notice-card"
        },
        React.createElement("div", { className: "awb-panel-title" }, toast.title),
        toast.description ? React.createElement("p", { className: "awb-muted-copy" }, toast.description) : null,
        toast.intent ? React.createElement("span", { className: "awb-pill" }, toast.intent) : null
      )
    )
  );
}

export function LoadingState(props: {
  title?: string | undefined;
  description?: string | undefined;
}) {
  return React.createElement(
    "section",
    {
      className: "awb-empty-state",
      "data-testid": "ui-loading-state"
    },
    React.createElement("h2", { className: "awb-panel-title" }, props.title ?? "Loading"),
    React.createElement("p", { className: "awb-muted-copy" }, props.description ?? "Preparing governed admin surfaces.")
  );
}

export function ErrorState(props: {
  title?: string | undefined;
  description: string;
}) {
  return React.createElement(
    "section",
    {
      className: "awb-empty-state",
      "data-testid": "ui-error-state"
    },
    React.createElement("h2", { className: "awb-panel-title" }, props.title ?? "Something needs attention"),
    React.createElement("p", { className: "awb-muted-copy" }, props.description)
  );
}

export function formatPlatformDate(value: string | number | Date, pattern = "dd MMM yyyy"): string {
  const date = toValidDate(value);
  return date ? format(date, pattern) : "Unknown date";
}

export function formatPlatformDateTime(value: string | number | Date, pattern = "dd MMM yyyy, HH:mm"): string {
  const date = toValidDate(value);
  return date ? format(date, pattern) : "Unknown time";
}

export function formatPlatformRelativeTime(value: string | number | Date): string {
  const date = toValidDate(value);
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : "recently";
}

function toValidDate(value: string | number | Date): Date | undefined {
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : undefined;
}
