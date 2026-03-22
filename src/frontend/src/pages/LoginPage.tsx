import { Button } from "@/components/ui/button";
import { Globe, Loader2, Printer, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.18 0.05 230) 0%, oklch(0.23 0.06 230) 50%, oklch(0.28 0.07 210) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-teal-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Printer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            CloudPrint
          </h1>
          <p className="text-teal-200 mt-2 text-sm">
            Smart printer sharing for teams
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-white font-semibold text-lg">
              Sign in to continue
            </h2>
            <p className="text-white/60 text-sm">
              Access your printers and print jobs securely.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                icon: <Shield className="w-4 h-4" />,
                text: "Secure Internet Identity login",
              },
              {
                icon: <Zap className="w-4 h-4" />,
                text: "Priority-based job queuing",
              },
              {
                icon: <Globe className="w-4 h-4" />,
                text: "4 shared cloud printers",
              },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2.5 text-white/70 text-sm"
              >
                <span className="text-teal-300">{icon}</span>
                {text}
              </div>
            ))}
          </div>

          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full bg-teal-400 hover:bg-teal-300 text-navy-800 font-bold py-3 rounded-xl text-base"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/70"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
