const fs = require('fs');

let c = fs.readFileSync('src/components/clima/HomeHero.tsx', 'utf8');

c = c.replace('min-h-[85vh] pt-10 pb-32', 'py-8');
c = c.replace(/<div className="inline-flex.*?Mindful Daily Eating[\s\S]*?<\/div>/, '');

c = c.replace(/<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-\[1\.15\] mb-4">[\s\S]*?<\/h1>/, `<h1 className="text-4xl sm:text-5xl font-serif italic text-foreground leading-[1.15] mb-4 text-brand">
          Healthy eating, built around your life.
        </h1>`);

c = c.replace(/ClimaDiet crafts a 7-day meal plan around your medical needs, local weather, kitchen ingredients, and weekly budget\./g, 'Build a meal plan around your needs and weather.');

c = c.replace('<span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand">Active</span>', '');

c = c.replace('absolute -right-2 top-8', 'absolute right-4 sm:-right-2 top-8');
c = c.replace('absolute -left-2 bottom-16', 'absolute left-4 sm:-left-2 bottom-16');

fs.writeFileSync('src/components/clima/HomeHero.tsx', c, 'utf8');
console.log('Fixed Home Hero!');
