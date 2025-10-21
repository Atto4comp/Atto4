const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testStreamlink(url, quality = 'best') {
  try {
    console.log(`Testing Streamlink with URL: ${url}`);
    console.log(`Quality: ${quality}\n`);

    // Check if Streamlink is installed
    try {
      const { stdout: version } = await execAsync('streamlink --version');
      console.log(`Streamlink version: ${version.trim()}\n`);
    } catch {
      console.error('❌ Streamlink is not installed!');
      console.error('Install with: brew install streamlink (macOS) or pip install streamlink');
      process.exit(1);
    }

    // Get available streams
    console.log('Fetching available streams...');
    const { stdout: jsonData } = await execAsync(`streamlink --json "${url}"`);
    const data = JSON.parse(jsonData);

    console.log('\nAvailable streams:');
    Object.keys(data.streams || {}).forEach((q) => {
      console.log(`  - ${q}`);
    });

    // Extract stream URL
    console.log(`\nExtracting ${quality} stream URL...`);
    const { stdout: streamUrl } = await execAsync(
      `streamlink --stream-url "${url}" ${quality}`
    );

    console.log('\n✅ Stream URL extracted:');
    console.log(streamUrl.trim());

    return streamUrl.trim();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run test
const url = process.argv[2] || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const quality = process.argv[3] || 'best';

testStreamlink(url, quality);
