import { Link } from "react-router-dom";

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-slate-200/20 dark:border-slate-800/20 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 max-w-screen-2xl mx-auto gap-4">
        
        <p className="font-inter text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} OpenPlanAhead.{" "}
          <Link to="/team" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Meet the Team
          </Link>
        </p>

        <div className="flex gap-8">
          <a
            href="#"
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Support
          </a>
          <a
            href="#"
            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Feedback
          </a>
        </div>

      </div>
    </footer>
  );
}