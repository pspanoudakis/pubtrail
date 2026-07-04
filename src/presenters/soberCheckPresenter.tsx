import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { Gyroscope } from "expo-sensors";
import { SoberCheckView, GamePhase } from "@/views/soberCheckView";
import {Platform} from "react-native";
import {router} from "expo-router";

const GAME_DURATION_SEC = 10;
const TICK_INTERVAL_MS = 50;
const GYRO_UPDATE_MS = 16;

const SENSITIVITY = 23;
const DAMPING = 0.92;
const MAX_OFFSET = 1;

const ORBIT_RADIUS = 0.35;
const ORBIT_PERIOD_X = 7;
const ORBIT_PERIOD_Y = 5;

const RING_OUTER_START = 0.30;
const RING_OUTER_END = 0.20;

type Vec2 = { x: number; y: number };

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

function getVerdict(score: number): { emoji: string; label: string; detail: string } {
    if (score >= 90) return { emoji: "🧊", label: "Stone Cold Sober", detail: "Surgeon-steady hands! You could thread a needle on a rollercoaster." };
    if (score >= 70) return { emoji: "😎", label: "Totally Fine", detail: "Rock solid. You're good to go." };
    if (score >= 50) return { emoji: "🍺", label: "Feeling It", detail: "A little wobbly… maybe switch to water." };
    if (score >= 30) return { emoji: "🥴", label: "Tipsy", detail: "The room is definitely spinning a bit." };
    return { emoji: "🚕", label: "Call a Cab", detail: "Put the phone down and find a cozy seat." };
}

export function SoberCheckPresenter(): ReactElement {
    const [phase, setPhase] = useState<GamePhase>("idle");
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
    const [ballPos, setBallPos] = useState<Vec2>({ x: 0, y: 0 });
    const [ringCenter, setRingCenter] = useState<Vec2>({ x: 0, y: 0 });
    const [outerRadius, setOuterRadius] = useState(RING_OUTER_START);
    const [score, setScore] = useState(0);
    const [verdict, setVerdict] = useState(getVerdict(100));

    const velocityRef = useRef<Vec2>({ x: 0, y: 0 });
    const posRef = useRef<Vec2>({ x: 0, y: 0 });
    const gyroRef = useRef<Vec2>({ x: 0, y: 0 });
    const insideTicksRef = useRef(0);
    const totalTicksRef = useRef(0);

    const resetGame = useCallback(() => {
        velocityRef.current = { x: 0, y: 0 };
        posRef.current = { x: 0, y: 0 };
        gyroRef.current = { x: 0, y: 0 };
        insideTicksRef.current = 0;
        totalTicksRef.current = 0;
        setBallPos({ x: 0, y: 0 });
        setRingCenter({ x: 0, y: 0 });
        setOuterRadius(RING_OUTER_START);
        setTimeLeft(GAME_DURATION_SEC);
        setScore(0);
    }, []);

    const startGame = useCallback(() => {
        resetGame();
        setPhase("countdown");
        setCountdown(3);
    }, [resetGame]);

    // Countdown phase
    useEffect(() => {
        if (phase !== "countdown") return;
        if (countdown <= 0) {
            setPhase("playing");
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [phase, countdown]);

    useEffect(() => {
        if (phase !== "playing") return;

        Gyroscope.setUpdateInterval(GYRO_UPDATE_MS);
        const subscription = Gyroscope.addListener(({ x, y }) => {
            gyroRef.current = { x: y, y: x };
        });

        return () => subscription.remove();
    }, [phase]);

    useEffect(() => {
        if (phase !== "playing") return;

        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / GAME_DURATION_SEC, 1);

            const ringX = ORBIT_RADIUS * Math.sin(2 * Math.PI * elapsed / ORBIT_PERIOD_X);
            const ringY = ORBIT_RADIUS * Math.cos(2 * Math.PI * elapsed / ORBIT_PERIOD_Y);
            setRingCenter({ x: ringX, y: ringY });

            const curOuterRadius = RING_OUTER_START - (RING_OUTER_START - RING_OUTER_END) * progress;
            setOuterRadius(curOuterRadius);

            const vel = velocityRef.current;
            const pos = posRef.current;
            const gyro = gyroRef.current;

            vel.x = (vel.x + gyro.x * SENSITIVITY * (TICK_INTERVAL_MS / 1000)) * DAMPING;
            vel.y = (vel.y + gyro.y * SENSITIVITY * (TICK_INTERVAL_MS / 1000)) * DAMPING;

            pos.x = clamp(pos.x + vel.x * (TICK_INTERVAL_MS / 1000), -MAX_OFFSET, MAX_OFFSET);
            pos.y = clamp(pos.y + vel.y * (TICK_INTERVAL_MS / 1000), -MAX_OFFSET, MAX_OFFSET);

            velocityRef.current = vel;
            posRef.current = pos;

            const dx = pos.x - ringX;
            const dy = pos.y - ringY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            totalTicksRef.current += 1;
            if (dist <= curOuterRadius) {
                insideTicksRef.current += 1;
            }

            setBallPos({ x: pos.x, y: pos.y });
            setTimeLeft(Math.max(GAME_DURATION_SEC - elapsed, 0));

            if (elapsed >= GAME_DURATION_SEC) {
                clearInterval(interval);
                const finalScore = Math.round(
                    (insideTicksRef.current / Math.max(totalTicksRef.current, 1)) * 100
                );
                setScore(finalScore);
                setVerdict(getVerdict(finalScore));
                setPhase("result");
            }
        }, TICK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [phase]);

    return (
        <SoberCheckView
            phase={phase}
            countdown={countdown}
            timeLeft={Math.ceil(timeLeft)}
            ballPos={ballPos}
            ringCenter={ringCenter}
            outerRadius={outerRadius}
            score={score}
            verdict={verdict}
            onStart={startGame}
            onRetry={startGame}
            gameEnabled={Platform.OS !== "web"} // Gyroscope not supported on web
            onCancel={() => router.back()}
        />
    );
}
