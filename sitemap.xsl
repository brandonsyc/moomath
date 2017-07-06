<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <html>
  <head>
    <link rel="stylesheet" type="text/css" href="styles.css" />
  </head>
  <body>
    <div id="top"></div>
    <div class="content">
      <h1>Sitemap</h1>
      <ul>
        <xsl:for-each select="urlset/url">
          <li><xsl:value-of select="loc" /></li>
        </xsl:for-each>
      </ul>
    </div>
    <div id="bottom"></div>
    <script src="frame.js"></script>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
