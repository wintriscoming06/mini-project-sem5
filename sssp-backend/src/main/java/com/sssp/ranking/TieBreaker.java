package com.sssp.ranking;

import com.sssp.gpi.GPIRecord;
import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class TieBreaker implements Comparator<GPIRecord> {

    @Override
    public int compare(GPIRecord o1, GPIRecord o2) {
        if (o1 == null && o2 == null) return 0;
        if (o1 == null) return 1;
        if (o2 == null) return -1;

        int gpiComp = Double.compare(o2.getGpi(), o1.getGpi());
        if (gpiComp != 0) return gpiComp;

        int conf1 = o1.getDataConfidence() == null ? -1 : o1.getDataConfidence().ordinal();
        int conf2 = o2.getDataConfidence() == null ? -1 : o2.getDataConfidence().ordinal();
        int confComp = Integer.compare(conf2, conf1);
        if (confComp != 0) return confComp;

        int matchComp = Integer.compare(o2.getMatchesConsidered(), o1.getMatchesConsidered());
        if (matchComp != 0) return matchComp;

        int formComp = Double.compare(o2.getRecentForm(), o1.getRecentForm());
        if (formComp != 0) return formComp;

        return Double.compare(o2.getConsistency(), o1.getConsistency());
    }
}
