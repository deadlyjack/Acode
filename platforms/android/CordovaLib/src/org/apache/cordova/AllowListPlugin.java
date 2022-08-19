/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/

package org.apache.cordova;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.LOG;
import org.apache.cordova.AllowList;
import org.apache.cordova.CordovaPreferences;
import org.xmlpull.v1.XmlPullParser;

import android.content.Context;

public class AllowListPlugin extends CordovaPlugin {
    public static final String PLUGIN_NAME = "CordovaAllowListPlugin";
    protected static final String LOG_TAG = "CordovaAllowListPlugin";

    private AllowList allowedNavigations;
    private AllowList allowedIntents;
    private AllowList allowedRequests;

    // Used when instantiated via reflection by PluginManager
    public AllowListPlugin() { }

    // These can be used by embedders to allow Java-configuration of an allow list.
    public AllowListPlugin(Context context) {
        this(new AllowList(), new AllowList(), null);
        new CustomConfigXmlParser().parse(context);
    }

    public AllowListPlugin(XmlPullParser xmlParser) {
        this(new AllowList(), new AllowList(), null);
        new CustomConfigXmlParser().parse(xmlParser);
    }

    public AllowListPlugin(AllowList allowedNavigations, AllowList allowedIntents, AllowList allowedRequests) {
        if (allowedRequests == null) {
            allowedRequests = new AllowList();
            allowedRequests.addAllowListEntry("file:///*", false);
            allowedRequests.addAllowListEntry("data:*", false);
        }

        this.allowedNavigations = allowedNavigations;
        this.allowedIntents = allowedIntents;
        this.allowedRequests = allowedRequests;
    }

    @Override
    public void pluginInitialize() {
        if (this.allowedNavigations == null) {
            this.allowedNavigations = new AllowList();
            this.allowedIntents = new AllowList();
            this.allowedRequests = new AllowList();

            new CustomConfigXmlParser().parse(webView.getContext());
        }
    }

    private class CustomConfigXmlParser extends ConfigXmlParser {
        private CordovaPreferences prefs = new CordovaPreferences();

        @Override
        public void handleStartTag(XmlPullParser xml) {
            String strNode = xml.getName();
            if (strNode.equals("content")) {
                String startPage = xml.getAttributeValue(null, "src");
                allowedNavigations.addAllowListEntry(startPage, false);
            } else if (strNode.equals("allow-navigation")) {
                String origin = xml.getAttributeValue(null, "href");
                if ("*".equals(origin)) {
                    allowedNavigations.addAllowListEntry("http://*/*", false);
                    allowedNavigations.addAllowListEntry("https://*/*", false);
                    allowedNavigations.addAllowListEntry("data:*", false);
                } else {
                    allowedNavigations.addAllowListEntry(origin, false);
                }
            } else if (strNode.equals("allow-intent")) {
                String origin = xml.getAttributeValue(null, "href");
                allowedIntents.addAllowListEntry(origin, false);
            } else if (strNode.equals("access")) {
                String origin = xml.getAttributeValue(null, "origin");

                if (origin != null) {
                    if ("*".equals(origin)) {
                        allowedRequests.addAllowListEntry("http://*/*", false);
                        allowedRequests.addAllowListEntry("https://*/*", false);
                    } else {
                        String subdomains = xml.getAttributeValue(null, "subdomains");
                        allowedRequests.addAllowListEntry(origin, (subdomains != null) && (subdomains.compareToIgnoreCase("true") == 0));
                    }
                }
            }
        }

        @Override
        public void handleEndTag(XmlPullParser xml) { }
    }

    @Override
    public Boolean shouldAllowNavigation(String url) {
        return this.allowedNavigations.isUrlAllowListed(url)
            ? true
            : null; // default policy
    }

    @Override
    public Boolean shouldAllowRequest(String url) {
        return (Boolean.TRUE.equals(this.shouldAllowNavigation(url)) || this.allowedRequests.isUrlAllowListed(url))
            ? true
            : null; // default policy
    }

    @Override
    public Boolean shouldOpenExternalUrl(String url) {
        return (this.allowedIntents.isUrlAllowListed(url))
            ? true
            : null; // default policy
    }

    public AllowList getAllowedNavigations() {
        return this.allowedNavigations;
    }

    public void setAllowedNavigations(AllowList allowedNavigations) {
        this.allowedNavigations = allowedNavigations;
    }

    public AllowList getAllowedIntents() {
        return this.allowedIntents;
    }

    public void setAllowedIntents(AllowList allowedIntents) {
        this.allowedIntents = allowedIntents;
    }

    public AllowList getAllowedRequests() {
        return this.allowedRequests;
    }

    public void setAllowedRequests(AllowList allowedRequests) {
        this.allowedRequests = allowedRequests;
    }
}
