package com.hrms.apar.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Target {

    private String target;
    private String achievement;

    public Target() {}

    public Target(String target, String achievement) {
        this.target = target;
        this.achievement = achievement;
    }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public String getAchievement() { return achievement; }
    public void setAchievement(String achievement) { this.achievement = achievement; }
}
