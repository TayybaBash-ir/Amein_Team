const fs = require('fs');
let p = fs.readFileSync('src/app/profile/page.tsx', 'utf8');
p += `
        {/* Sign Out Button at the very bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col items-center">
          <p className="text-xs text-muted-foreground mb-4">Account Management</p>
          <AuthButton />
        </div>
      </main>
    </div>
  );
}
`;
fs.writeFileSync('src/app/profile/page.tsx', p, 'utf8');
