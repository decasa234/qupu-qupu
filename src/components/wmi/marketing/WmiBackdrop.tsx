import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion'

type WmiBackdropProps = {
  className?: string
}

/**
 * Subtle animated SVG backdrop for the /wmi page.
 *
 * Renders an absolutely-positioned, pointer-events-none, -z-10 layer that fills
 * its (relative) parent. A few gently drifting wavy strokes + softly morphing
 * blobs in brand colors at low opacity float behind the content over the cream
 * (#FFF2DF) page bg — tasteful, never distracting.
 *
 * Honors prefers-reduced-motion: the same shapes render fully static.
 */
export default function WmiBackdrop({ className }: WmiBackdropProps = {}) {
  const reduce = useReducedMotion()

  // When reduced, hand framer-motion no animate/transition so shapes stay put.
  const drift = (
    animate: TargetAndTransition,
    transition: Transition,
  ) => (reduce ? {} : { animate, transition })

  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft morphing blob — brand yellow, top-left */}
        <motion.path
          d="M180 200C260 150 380 160 430 240C480 320 430 430 330 470C230 510 120 470 90 370C60 270 100 250 180 200Z"
          fill="#ffdd55"
          opacity={0.1}
          {...drift(
            {
              d: [
                'M180 200C260 150 380 160 430 240C480 320 430 430 330 470C230 510 120 470 90 370C60 270 100 250 180 200Z',
                'M200 180C300 140 400 190 440 270C480 350 410 450 310 480C210 510 110 450 90 350C70 250 100 220 200 180Z',
                'M180 200C260 150 380 160 430 240C480 320 430 430 330 470C230 510 120 470 90 370C60 270 100 250 180 200Z',
              ],
            },
            {
              duration: 22,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
          )}
        />

        {/* Soft morphing blob — brand peach, bottom-right */}
        <motion.path
          d="M980 560C1060 520 1160 560 1180 650C1200 740 1130 800 1030 800C930 800 860 760 850 670C840 580 900 600 980 560Z"
          fill="#FFD3B1"
          opacity={0.12}
          {...drift(
            {
              d: [
                'M980 560C1060 520 1160 560 1180 650C1200 740 1130 800 1030 800C930 800 860 760 850 670C840 580 900 600 980 560Z',
                'M1000 540C1080 510 1170 580 1180 670C1190 760 1110 800 1010 800C910 800 850 740 850 650C850 560 920 570 1000 540Z',
                'M980 560C1060 520 1160 560 1180 650C1200 740 1130 800 1030 800C930 800 860 760 850 670C840 580 900 600 980 560Z',
              ],
            },
            {
              duration: 26,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: 1.5,
            },
          )}
        />

        {/* Drifting wavy stroke — brand blue */}
        <motion.path
          d="M-100 320C100 260 300 380 500 320C700 260 900 380 1100 320C1200 290 1280 320 1340 300"
          stroke="#30598A"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.07}
          {...drift(
            { x: [0, -70, 0], y: [0, 18, 0] },
            {
              duration: 18,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
          )}
        />

        {/* Drifting wavy stroke — brand orange */}
        <motion.path
          d="M-100 520C120 470 280 600 520 540C760 480 940 610 1140 540C1240 505 1300 540 1360 520"
          stroke="#f0853a"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.08}
          {...drift(
            { x: [0, 80, 0], y: [0, -16, 0] },
            {
              duration: 24,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: 2,
            },
          )}
        />

        {/* Slow-floating accent circle — brand yellow */}
        <motion.circle
          cx={760}
          cy={180}
          r={42}
          fill="#ffdd55"
          opacity={0.09}
          {...drift(
            { cy: [180, 150, 180], opacity: [0.09, 0.06, 0.09] },
            {
              duration: 14,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            },
          )}
        />

        {/* Slow-floating accent circle — brand blue */}
        <motion.circle
          cx={300}
          cy={640}
          r={30}
          fill="#30598A"
          opacity={0.07}
          {...drift(
            { cx: [300, 340, 300], opacity: [0.07, 0.05, 0.07] },
            {
              duration: 16,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: 1,
            },
          )}
        />
      </svg>
    </div>
  )
}
