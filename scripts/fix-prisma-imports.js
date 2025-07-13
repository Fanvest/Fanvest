const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/polls/[id]/vote/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/polls/[id]/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/polls/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/votes/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/auth/user/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/clubs/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/upload/club-logo/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/clubs/requests/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/upload/profile/route.ts',
  '/home/npalissi/Documents/hackathon_chiliz/frontend/app/api/clubs/requests/[id]/route.ts'
];

function fixPrismaImports() {
  let fixedCount = 0;

  filesToFix.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file uses old import
        if (content.includes("import { prisma } from '@/lib/database';")) {
          console.log(`🔧 Fixing: ${path.basename(filePath)}`);
          
          // Replace the import
          content = content.replace(
            "import { prisma } from '@/lib/database';",
            "import { PrismaClient } from '@/lib/generated/prisma';\n\nconst prisma = new PrismaClient();"
          );
          
          // Write back the fixed content
          fs.writeFileSync(filePath, content, 'utf8');
          fixedCount++;
          console.log(`✅ Fixed: ${path.basename(filePath)}`);
        } else {
          console.log(`⚪ Already correct: ${path.basename(filePath)}`);
        }
      } else {
        console.log(`❌ File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  });

  console.log(`\n🎉 Fixed ${fixedCount} files!`);
}

fixPrismaImports();