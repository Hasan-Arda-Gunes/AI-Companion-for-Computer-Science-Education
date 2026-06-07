import { motion } from 'motion/react'

const particles = [
    { left: '8%', top: '18%', duration: 6.4, delay: 0.1 },
    { left: '18%', top: '72%', duration: 7.1, delay: 0.8 },
    { left: '26%', top: '42%', duration: 5.8, delay: 0.4 },
    { left: '34%', top: '86%', duration: 6.9, delay: 1.2 },
    { left: '42%', top: '25%', duration: 7.3, delay: 0.2 },
    { left: '55%', top: '68%', duration: 6.1, delay: 0.9 },
    { left: '63%', top: '34%', duration: 5.6, delay: 0.5 },
    { left: '74%', top: '82%', duration: 6.7, delay: 1.4 },
    { left: '82%', top: '22%', duration: 6.2, delay: 0.3 },
    { left: '90%', top: '58%', duration: 7.5, delay: 1.1 },
]

export function AuthParticles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0.6 }}
                animate={{
                    opacity: [0.5, 0.85, 0.5],
                    scale: [1, 1.03, 1],
                }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                style={{
                    background:
                        'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
                }}
            />
            {particles.map((particle) => (
                <motion.div
                    key={`${particle.left}-${particle.top}`}
                    className="absolute h-1 w-1 rounded-full bg-primary"
                    style={{ left: particle.left, top: particle.top }}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 0.6, 0], y: [0, -24, 0] }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    )
}
