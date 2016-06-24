package hci.itba.edu.ar.tpe2.fragment;

import android.content.Context;
import android.support.design.widget.CoordinatorLayout;
import android.support.design.widget.Snackbar;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import com.nostra13.universalimageloader.core.ImageLoader;

import java.util.List;
import java.util.Map;

import hci.itba.edu.ar.tpe2.R;
import hci.itba.edu.ar.tpe2.backend.data.Flight;
import hci.itba.edu.ar.tpe2.backend.data.FlightStatus;
import hci.itba.edu.ar.tpe2.backend.data.PersistentData;

/**
 * Adapter for displaying list of flights.
 */
public class FlightStatusAdapter extends ArrayAdapter<FlightStatus> {
    private CoordinatorLayout mCoordinatorLayout;
    private final PersistentData persistentData;
    private Map<Integer, FlightStatus> watchedStatuses;
    private StarInterface starInterface;
    private boolean setBottomPadding;

    FlightStatusAdapter(Context context, List<FlightStatus> objects, CoordinatorLayout layoutWithFAB, StarInterface starInterface) {
        super(context, 0, objects);
        persistentData = new PersistentData(context);
        mCoordinatorLayout = layoutWithFAB;
        watchedStatuses = persistentData.getWatchedStatuses();
        this.starInterface = starInterface;
        setBottomPadding = false;
    }

    @Override
    public View getView(final int position, View destination, final ViewGroup parent) {
        if (!setBottomPadding) {     //Add bottom padding to not cover up last item with FAB
            float scale = parent.getContext().getResources().getDisplayMetrics().density;
            int bottomPaddingDP = (int) ((56 + 16 + 5) * scale + 0.5f);   //56dp FAB size + 16dp FAB margin + 5dp for wiggle room
            parent.setPadding(0, 0, 0, bottomPaddingDP);
            parent.setClipToPadding(false);                 //http://stackoverflow.com/questions/28916426/last-item-of-listview-fab-hides-it
            setBottomPadding = true;
        }
        if (destination == null) {  //Item hasn't been created, inflate it from Android's default layout
            destination = LayoutInflater.from(getContext()).inflate(R.layout.list_item_flight_status, parent, false);
        }
        final FlightStatus status = getItem(position);
        final Flight flight = status.getFlight();

        //Logo
        ImageView icon = (ImageView) destination.findViewById(R.id.icon);
        ImageLoader.getInstance().displayImage(status.getAirline().getLogoURL(), icon);

        //Text
        TextView title = (TextView) destination.findViewById(R.id.flight_text);
        title.setText(flight.toString());

        //Status
        ImageView statusIcon = (ImageView) destination.findViewById(R.id.status_icon);
        statusIcon.setImageDrawable(getContext().getDrawable(status.getIconID()));

        //Star
        final ImageButton star = (ImageButton) destination.findViewById(R.id.follow);
        star.setImageResource(watchedStatuses.containsValue(status) ? R.drawable.ic_star_on_24dp : R.drawable.ic_star_off_24dp);
        star.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (watchedStatuses.containsValue(status)) {
                    persistentData.stopWatchingStatus(status);
                    FlightStatusAdapter.this.notifyDataSetChanged();
                    star.setImageResource(R.drawable.ic_star_off_24dp);
                    starInterface.onFlightUnstarred(status);

                    Snackbar.make(mCoordinatorLayout == null ? v : mCoordinatorLayout, "Removed " + flight.toString(), Snackbar.LENGTH_INDEFINITE).setAction("Undo", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            persistentData.watchStatus(status);
                            FlightStatusAdapter.this.notifyDataSetChanged();
                            star.setImageResource(R.drawable.ic_star_on_24dp);
                        }
                    }).show();
                } else {
                    persistentData.watchStatus(status);
                    FlightStatusAdapter.this.notifyDataSetChanged();
                    star.setImageResource(R.drawable.ic_star_on_24dp);
                    Snackbar.make(mCoordinatorLayout == null ? v : mCoordinatorLayout, "Following " + flight.toString(), Snackbar.LENGTH_INDEFINITE).setAction("Undo", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            persistentData.stopWatchingStatus(status);
                            FlightStatusAdapter.this.notifyDataSetChanged();
                            star.setImageResource(R.drawable.ic_star_off_24dp);
                        }
                    }).show();
                }
            }
        });
        return destination;
    }
}