import { useNavigation, usePathname, useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BackHandler } from "react-native";
import ExitOrContinue from "../components/ExitOrContinue";

type Pending = null | (() => void);

type ExitGuardContext = {
  askToExit: (onConfirm: () => void) => void;
};

const ExitGuardCtx = createContext<ExitGuardContext | null>(null);

type Props = {
  children: React.ReactNode;
};

export default function ExitGuardProvider({ children }: Props) {
  const [visible, setVisible] = useState(false);
  const pending = useRef<Pending>(null);

  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname(); // "/", "/gamePage"
  const isGamePage = pathname === "/gamePage";

  const askToExit = useCallback((onConfirm: () => void) => {
    pending.current = onConfirm;
    setVisible(true);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isGamePage) {
        askToExit(() => router.replace("/"));
        return true;
      }

      const canGoBack = navigation.canGoBack?.() ?? false;
      if (!canGoBack) {
        askToExit(() => BackHandler.exitApp());
        return true;
      }

      return false; // let navigation handle normal back
    });

    return () => sub.remove();
  }, [askToExit, isGamePage, router, navigation]);

  const onExit = () => {
    setVisible(false);
    const run = pending.current;
    pending.current = null;
    run?.();
  };

  const onContinue = () => {
    pending.current = null;
    setVisible(false);
  };

  return (
    <ExitGuardCtx.Provider value={{ askToExit }}>
      {children}
      <ExitOrContinue
        modalVisible={visible}
        onModalClose={() => setVisible(false)}
        onExit={onExit}
        onContinue={onContinue}
        title={
          isGamePage
            ? "Do you want to quit this attempt?"
            : "Do you want to exit the app?"
        }
        continueLabel="Continue"
        exitLabel={isGamePage ? "Quit Attempt" : "Exit App"}
        showEmoji={false}
      />
    </ExitGuardCtx.Provider>
  );
}

export function useExitGuard() {
  const ctx = useContext(ExitGuardCtx);
  if (!ctx)
    throw new Error("useExitGuard must be used inside <ExitGuardProvider>");
  return ctx;
}
