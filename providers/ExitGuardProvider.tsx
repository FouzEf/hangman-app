import { useNavigation } from "expo-router";
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
  console.log("ExitGuardProvider mounted");
  const [visible, setVisible] = useState(false);
  /*  useEffect(() => {
    console.log("HARD DISABLED MODAL");
    setVisible(false); // force-disable
  }, []); */
  const pending = useRef<Pending>(null);
  const navigation = useNavigation();

  const askToExit = useCallback((onConfirm: () => void) => {
    console.log("askToExit CALLED");
    pending.current = onConfirm;
    setVisible(true);
  }, []);

  useEffect(() => {
    console.log("MODAL visible?", visible);
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const canGoBack = navigation.canGoBack?.() ?? false;

      if (!canGoBack) {
        console.log("At root - showing exit modal");
        askToExit(() => BackHandler.exitApp());
        return true;
      }

      return false; // allow navigation to handle back
    });

    return () => sub.remove();
  }, [askToExit, navigation, visible]);

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
