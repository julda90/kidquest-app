package com.KidQuest.kidquest_app.service;

import com.KidQuest.kidquest_app.model.Child;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class LevelThresholdTest {

    private ProgressService svc;
    private Child older;
    private Child younger;

    @BeforeEach
    void setUp() {
        svc = new ProgressService(mock(com.KidQuest.kidquest_app.repository.PointTransactionRepository.class),
                mock(com.KidQuest.kidquest_app.repository.ChildBadgeRepository.class),
                mock(com.KidQuest.kidquest_app.repository.RewardRedemptionRepository.class),
                java.time.Clock.systemDefaultZone(),
                new ObjectMapper());
        svc.loadLevels();

        older = new Child();
        older.setAge(8);
        older.setAvatar("minecraft");

        younger = new Child();
        younger.setAge(4);
        younger.setAvatar("unicorn");
    }

    @Test
    void olderChildLevel1AtZeroXp() {
        ProgressService.LevelInfo li = svc.levelFromXp(older, 0);
        assertEquals(1, li.level());
        assertEquals(0, li.prestigeStars());
        assertEquals(12, li.maxLevel());
    }

    @Test
    void olderChildLevel2At150Xp() {
        ProgressService.LevelInfo li = svc.levelFromXp(older, 150);
        assertEquals(2, li.level());
        assertEquals(0, li.prestigeStars());
    }

    @Test
    void olderChildMaxLevelAt18000Xp() {
        ProgressService.LevelInfo li = svc.levelFromXp(older, 18000);
        assertEquals(12, li.level());
        assertEquals(1, li.prestigeStars());
        assertEquals(0.0, li.progressPct(), 0.01);
    }

    @Test
    void youngerChildLevel2At75Xp() {
        ProgressService.LevelInfo li = svc.levelFromXp(younger, 75);
        assertEquals(2, li.level());
        assertEquals(0, li.prestigeStars());
    }

    @Test
    void youngerChildPrestigeAt9000Xp() {
        ProgressService.LevelInfo li = svc.levelFromXp(younger, 9000);
        assertEquals(12, li.level());
        assertEquals(1, li.prestigeStars());
    }
}
