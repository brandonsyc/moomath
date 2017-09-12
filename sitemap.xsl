<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<head>
				<title>Sitemap</title>
				<link rel="stylesheet" type="text/css" href="styles.css" />
				<link rel="icon" href="images/favicon.png" sizes="16x16" type="image/png" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body>
				<div id="top"></div>
				<div class="content">
					<div class="article">
						<h1>Sitemap</h1>
						<hr></hr>
						<xsl:for-each select="s:urlset/s:url">
							<h3><xsl:value-of select="s:loc" /></h3>
							<p><strong>Last modification: </strong><xsl:value-of select="s:lastmod" /></p>
							<p><strong>Images:</strong></p>
							<ol>
								<xsl:for-each select="image:image">
									<li>
										<xsl:value-of select="image:loc" />
									</li>
								</xsl:for-each>
							</ol>
						</xsl:for-each>
					</div>
				</div>
				<div id="bottom"></div>
				<script src="frame.js"></script>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>