import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('import { AnimatePresence, motion } from "framer-motion";', 'import { AnimatePresence, motion } from "framer-motion";\nimport CheckInModal from "@/components/clima/CheckInModal";\nimport { MdAssessment } from "react-icons/md";')

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
