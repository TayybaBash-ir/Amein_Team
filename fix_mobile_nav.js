const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const regex = /<div className="flex sm:hidden overflow-x-auto p-3 border-b border-border bg-background gap-2 print:hidden scrollbar-hide">[\s\S]*?<\/div>/m;
const newNav = `<div className="flex sm:hidden justify-around p-3 border-b border-border bg-background gap-2 print:hidden scrollbar-hide">
          {step !== "home" && activeTab === "generate" && (
            <button onClick={() => setStep("home")} className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground">
              <MdArrowBack size={24} />
            </button>
          )}
          <button onClick={() => { setActiveTab("generate"); setStep("home"); }} className={\`flex items-center justify-center p-2 rounded-lg \${activeTab === "generate" ? "text-brand" : "text-muted-foreground hover:bg-surface-2"}\`}>
            <MdDashboard size={24} />
          </button>
          <button onClick={() => setActiveTab("restaurants")} className={\`flex items-center justify-center p-2 rounded-lg \${activeTab === "restaurants" ? "text-brand" : "text-muted-foreground hover:bg-surface-2"}\`}>
            <MdRestaurantMenu size={24} />
          </button>
          <Link href="/profile" className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2">
            <MdPerson size={24} />
          </Link>
          <Link href="/plans" className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2">
            <MdList size={24} />
          </Link>
        </div>`;

if (regex.test(c)) {
    c = c.replace(regex, newNav);
    fs.writeFileSync('src/app/dashboard/page.tsx', c, 'utf8');
    console.log('Mobile nav replaced successfully!');
} else {
    console.log('Regex did not match.');
}
