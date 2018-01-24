<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<head>
				<meta charset="utf-8" />
				<title>Sitemap</title>
				<link rel="stylesheet" type="text/css" href="sticky.css" />
				<link rel="stylesheet" type="text/css" href="sitemap.css" />
				<link rel="icon" href="images/favicon.png" sizes="16x16" type="image/png" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body>
				<div>
					<xsl:for-each select="s:urlset/s:url">
						<strong><xsl:value-of select="s:loc" /></strong>
						<br />
						Last modification: <xsl:value-of select="s:lastmod" />
						<br />
						Priority: <xsl:value-of select="s:priority" />
						<br />
						Images:
						<ol>
							<xsl:for-each select="image:image">
								<li>
									<xsl:value-of select="image:loc" />
								</li>
							</xsl:for-each>
						</ol>
					</xsl:for-each>
				</div>
				<script src="../sticky.js" />
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>